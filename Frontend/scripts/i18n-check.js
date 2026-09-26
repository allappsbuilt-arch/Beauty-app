#!/usr/bin/env node
// Translation health check.
//
//   npm run i18n:check
//
// 1. Finds every translation key used in src/ — t('…'), translate('…') and
//    `…Key: '…'` properties in data tables — and fails if any is missing from
//    en.json (a broken key would show on screen as the raw key).
// 2. Lists en.json keys no code uses.
// 3. For every other language, reports how much is translated and writes
//    translations/<code>-todo.csv (key, English, translation) for translators.
//    Fill in the translation column, then merge it with `--import <csv>`.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'i18n', 'locales');
const OUT = path.join(ROOT, 'translations');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function setPath(obj, key, value) {
  const parts = key.split('.');
  let node = obj;
  for (const p of parts.slice(0, -1)) node = node[p] = node[p] || {};
  node[parts[parts.length - 1]] = value;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// ── --audit [file…]: likely hard-coded English left in the UI ────────────────
// Heuristic — flags JSX text, text props and user-facing string literals that
// aren't going through t(). Mark a line `// i18n-ignore` to accept it.
if (process.argv.includes('--audit')) {
  const only = process.argv.slice(process.argv.indexOf('--audit') + 1)
    .map((f) => path.resolve(f))
    .flatMap((f) => (fs.statSync(f).isDirectory() ? walk(f) : [f]));
  const files = (only.length ? only : walk(SRC)).filter((f) => !f.startsWith(path.join(SRC, 'i18n')) && !f.includes(`${path.sep}theme${path.sep}`));
  const words = /[A-Za-z]{2,}/;
  const checks = [
    // JSX text on one line: >Some text<
    { re: />\s*([^<>{}\n]*[A-Za-z]{2,}[^<>{}\n]*?)\s*</g, group: 1 },
    // Text props
    { re: /\b(?:title|label|placeholder|accessibilityLabel|subtitle|message|hint|desc|description|caption|emptyText|cta|confirmLabel)=["']([^"']*[A-Za-z]{2,}[^"']*)["']/g, group: 1 },
    // Messages passed to alerts / error state
    { re: /\b(?:notify|confirm|Alert\.alert|set\w*Error|setError|setMessage|setStatus|throw new Error)\(\s*(['"`])((?:(?!\1).)*[A-Za-z]{2,}(?:(?!\1).)*)\1/g, group: 2 },
    // Display fields in data tables
    { re: /\b(?:label|title|desc|description|subtitle|text|sample|quote|message|hint|cta|tag|badge|body|tip|caption|headline|detail|note|placeholder|status|metricLabel|metricVal|value|unit|sub|name)\s*:\s*(['"])((?:(?!\1).)*[A-Za-z]{2,}(?:(?!\1).)*)\1/g, group: 2 },
    // || 'fallback text' and ternary text inside JSX expressions
    { re: /(?:\|\||\?)\s*(['"])((?:(?!\1).)*[A-Za-z]{2,}\s(?:(?!\1).)*)\1/g, group: 2 },
    { re: /\?[^:]*:\s*(['"])((?:(?!\1).)*[A-Za-z]{2,}\s(?:(?!\1).)*)\1/g, group: 2 },
  ];
  // Things that look like words but aren't UI text.
  const skip = (s) => !words.test(s)
    || /^[a-z0-9]+(?:[-_.][a-z0-9]+)+$/.test(s)          // icon-names, keys.like.this
    || /^(?:#|rgba?\(|https?:|\.\.?\/|data:)/.test(s)     // colours, URLs, paths
    || /^[A-Z][A-Za-z]+$/.test(s) && /navigate|route|screen/i.test(s) // route names
    || /^(?:ios|android|web|none|auto|cover|contain|center|row|column|flex-start|flex-end|space-between|bold|normal|italic|handled|done|next|default|light|dark|padding|height)$/.test(s);
  let total = 0;
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const hits = [];
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ') || line.includes('i18n-ignore') || line.includes('console.')) return;
      const found = new Set();
      for (const { re, group } of checks) {
        for (const m of line.matchAll(re)) {
          const s = m[group].trim();
          if (!skip(s) && !/\bt\(|translate\(/.test(s)) found.add(s);
        }
      }
      // A line that is just text inside JSX (multi-line <Text> content).
      if (/^[A-Za-z"“'][^=;{}<>()]*[a-z][^=;{}<>()]*[.!?:,)]?$/.test(trimmed) && /\s/.test(trimmed)
        && !/^(return|const|let|if|else|case|export|function|await|try)\b/.test(trimmed)
        && /[>]\s*$|<Text/.test(lines[i - 1] || '')) found.add(trimmed);
      for (const s of found) hits.push(`  ${i + 1}: ${s}`);
    });
    if (hits.length) {
      total += hits.length;
      console.log(`${path.relative(ROOT, file)} (${hits.length})`);
      console.log(hits.join('\n'));
    }
  }
  console.log(`\n${total} possible hard-coded string(s).`);
  process.exit(0);
}

// ── --import translations/<code>-todo.csv ────────────────────────────────────
const importIdx = process.argv.indexOf('--import');
if (importIdx !== -1) {
  const csvFile = process.argv[importIdx + 1];
  const code = path.basename(csvFile).split('-')[0];
  const localeFile = path.join(LOCALES, `${code}.json`);
  const locale = readJson(localeFile);
  const en = flatten(readJson(path.join(LOCALES, 'en.json')));
  let added = 0;
  for (const [key, , translation] of parseCsv(fs.readFileSync(csvFile, 'utf8')).slice(1)) {
    if (!key || !translation || !translation.trim()) continue;
    if (!(key in en)) { console.warn(`skip unknown key ${key}`); continue; }
    setPath(locale, key, translation.trim());
    added += 1;
  }
  fs.writeFileSync(localeFile, `${JSON.stringify(locale, null, 2)}\n`);
  console.log(`Imported ${added} ${code} translations into ${path.relative(ROOT, localeFile)}`);
  process.exit(0);
}

// ── Check ────────────────────────────────────────────────────────────────────
const en = flatten(readJson(path.join(LOCALES, 'en.json')));
const baseKeys = new Set(Object.keys(en).map((k) => k.replace(/_(zero|one|two|few|many|other)$/, '')));

const used = new Map(); // key -> first file:line
// Any quoted 'namespace.key' whose namespace exists (catches keys kept in arrays).
const namespaces = Object.keys(readJson(path.join(LOCALES, 'en.json'))).filter((k) => !k.startsWith('_')).join('|');
const patterns = [
  new RegExp(`['"]((?:${namespaces})\.[\w.]+)['"]`, 'g'),
  /\b(?:t|translate)\(\s*'([^']+)'/g,
  /\b(?:t|translate)\(\s*"([^"]+)"/g,
  /\b\w*Key\s*:\s*'([a-z][\w]*(?:\.[\w]+)+)'/g,
];
// src/i18n holds the translator itself (its comments contain example keys).
for (const file of walk(SRC).filter((f) => !f.startsWith(path.join(SRC, 'i18n')))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      if (!used.has(m[1])) {
        const line = text.slice(0, m.index).split('\n').length;
        used.set(m[1], `${path.relative(ROOT, file)}:${line}`);
      }
    }
  }
}

const broken = [...used].filter(([k]) => !baseKeys.has(k));
const unused = [...baseKeys].filter((k) => !used.has(k) && !k.startsWith('dynamic.'));

console.log(`English: ${Object.keys(en).length} strings, ${used.size} keys referenced in code.`);
if (unused.length) console.log(`Unused English keys (${unused.length}): ${unused.slice(0, 20).join(', ')}${unused.length > 20 ? ' …' : ''}`);

fs.mkdirSync(OUT, { recursive: true });
for (const file of fs.readdirSync(LOCALES).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
  const code = file.replace('.json', '');
  const locale = flatten(readJson(path.join(LOCALES, file)));
  const missing = Object.keys(en).filter((k) => !(typeof locale[k] === 'string' && locale[k].trim()));
  const done = Object.keys(en).length - missing.length;
  const pct = Math.round((done / Object.keys(en).length) * 100);
  console.log(`${code}: ${done}/${Object.keys(en).length} translated (${pct}%) — ${missing.length} need a native translation.`);
  const rows = [['key', 'english', 'translation', 'notes'].map(csvCell).join(',')];
  for (const k of Object.keys(en)) {
    const note = /\{\{\w+\}\}/.test(en[k]) ? 'Keep {{…}} placeholders unchanged' : '';
    rows.push([k, en[k], locale[k] || '', note].map(csvCell).join(','));
  }
  const csv = path.join(OUT, `${code}-todo.csv`);
  fs.writeFileSync(csv, `﻿${rows.join('\r\n')}\r\n`);
  console.log(`  → ${path.relative(ROOT, csv)}`);
}

if (broken.length) {
  console.error(`\n${broken.length} key(s) used in code but missing from en.json:`);
  for (const [k, where] of broken) console.error(`  ${k}  (${where})`);
  process.exit(1);
}
console.log('\nNo broken keys.');
