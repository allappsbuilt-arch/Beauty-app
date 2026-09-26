import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, DEFAULT_LANGUAGE, findLanguage } from './languages';
import { LOCALES } from './locales';

// ─── Translation lookup ──────────────────────────────────────────────────────
//
// Keys are dot paths into the locale JSON, e.g. t('home.greeting', { name }).
//  - `{{name}}` placeholders are filled from `params`.
//  - Pass `count` to pick a plural form: `key_one` / `key_other`.
//  - A key missing from the current language falls back to English, so a
//    partly translated language still shows every screen in full.

const STORAGE_KEY = 'beautyapp.language';

function lookup(table, key) {
  let node = table;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

// Plural categories for English-style counting (one vs other). Languages with
// more forms can add `_zero`, `_two`, `_few`, `_many` keys; Intl picks them.
function pluralSuffix(code, count) {
  try {
    return new Intl.PluralRules(code).select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
}

function resolve(code, key, count) {
  const tables = code === DEFAULT_LANGUAGE ? [LOCALES[code]] : [LOCALES[code], LOCALES[DEFAULT_LANGUAGE]];
  for (const table of tables) {
    if (!table) continue;
    if (typeof count === 'number') {
      const plural = lookup(table, `${key}_${pluralSuffix(code, count)}`) ?? lookup(table, `${key}_other`);
      if (plural !== undefined) return plural;
    }
    const value = lookup(table, key);
    if (value !== undefined) return value;
  }
  return undefined;
}

function interpolate(text, params) {
  if (!params) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (params[name] ?? match).toString());
}

// The active language for code that runs outside React components (alerts,
// scheduled notifications). Kept in step with the provider below.
let activeLanguage = DEFAULT_LANGUAGE;

export function translate(key, params, code = activeLanguage) {
  const text = resolve(code, key, params?.count);
  if (text === undefined) {
    if (__DEV__) console.warn(`[i18n] Missing English text for "${key}"`);
    return key;
  }
  return interpolate(text, params);
}

// Share of English keys the language has its own text for (0–1).
function countKeys(table, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(table || {})) {
    if (k.startsWith('_')) continue; // metadata such as `_meta`
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') countKeys(v, path, out);
    else if (typeof v === 'string' && v.trim()) out.add(path);
  }
  return out;
}

const englishKeys = countKeys(LOCALES[DEFAULT_LANGUAGE]);
export function translationCoverage(code) {
  if (code === DEFAULT_LANGUAGE) return 1;
  const own = countKeys(LOCALES[code]);
  let done = 0;
  englishKeys.forEach((k) => { if (own.has(k)) done += 1; });
  return englishKeys.size ? done / englishKeys.size : 0;
}

// ─── React provider ──────────────────────────────────────────────────────────

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => { if (saved && findLanguage(saved)) setLanguageState(saved); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  activeLanguage = language;

  const setLanguage = useCallback(async (code) => {
    if (!findLanguage(code)) return;
    activeLanguage = code;
    setLanguageState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  const t = useCallback((key, params) => translate(key, params, language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES, current: findLanguage(language) }),
    [language, setLanguage, t]
  );

  // Wait for the saved choice so the first screen doesn't flash in English.
  if (!ready) return null;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}

// ─── Sentences with inline links/emphasis ────────────────────────────────────
//
// Keeps a sentence whole for translators instead of splitting it around a
// link: "By signing up, you agree to our <link>Terms</link>."
// `renderTag(tag, text, index)` returns the element for each tagged part.
export function richText(text, renderTag) {
  const parts = [];
  const re = /<(\w+)>(.*?)<\/\1>/g;
  let last = 0;
  let match;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(renderTag(match[1], match[2], parts.length));
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Dates and numbers in the active language ────────────────────────────────
// Uses the device's Unicode CLDR data for the language when it has it,
// otherwise English — never a guessed translation.
function intlLocaleFor(code) {
  const wanted = findLanguage(code)?.intlLocale;
  try {
    if (wanted && Intl.DateTimeFormat.supportedLocalesOf([wanted]).length) return wanted;
  } catch { /* fall through */ }
  return findLanguage(DEFAULT_LANGUAGE).intlLocale;
}

export function formatDate(date, options, code = activeLanguage) {
  return new Date(date).toLocaleDateString(intlLocaleFor(code), options);
}

export function formatTimeOfDay(date, options = { hour: 'numeric', minute: '2-digit' }, code = activeLanguage) {
  return new Date(date).toLocaleTimeString(intlLocaleFor(code), options);
}

export function formatNumber(n, options, code = activeLanguage) {
  return Number(n).toLocaleString(intlLocaleFor(code), options);
}
