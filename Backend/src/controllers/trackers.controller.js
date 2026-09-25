const { supabase } = require('../db/database');
const checks = require('../services/dailyChecks.service');
const { todayStr, addDays } = require('../services/date.util');

const zone = (scan, key) => (scan.zones_json || []).find((z) => z.key === key);
const anc = (scan, key) => (scan.ancillary_json || []).find((a) => a.key === key);
const metric = (z, label) => z?.metrics?.find((m) => m.label === label)?.status ?? null;

// Where each tracker's score comes from in a scan, plus its daily checklist.
const AREAS = {
  eyebrow: {
    score: (s) => anc(s, 'brows')?.score,
    metrics: (s) => ({ fullness: anc(s, 'brows')?.metricVal ?? null }),
    items: [
      { key: 'revitabrow', label: 'RevitaBrow Advanced' },
      { key: 'castor', label: 'Castor Oil Serum' },
    ],
  },
  eyelash: {
    score: (s) => zone(s, 'eyes')?.extras?.lashLength,
    metrics: (s) => ({
      length: zone(s, 'eyes')?.extras?.lashLength ?? null,
      density: zone(s, 'eyes')?.extras?.lashDensity ?? null,
    }),
    items: [
      { key: 'cleanse', label: 'Clean daily with oil-free cleanser' },
      { key: 'spoolie', label: 'Brush through with a clean spoolie' },
    ],
  },
  undereye: {
    score: (s) => zone(s, 'eyes')?.score,
    metrics: (s) => ({
      darkCircles: metric(zone(s, 'eyes'), 'Dark Circles'),
      puffiness: metric(zone(s, 'eyes'), 'Puffiness'),
    }),
    items: [
      { key: 'cold', label: 'Cold Compress' },
      { key: 'gua', label: 'Gua Sha' },
      { key: 'jade', label: 'Jade Roller' },
      { key: 'patch', label: 'Eye Patches' },
      { key: 'eyedrops', label: 'Eye Drops Applied' },
    ],
  },
  lips: {
    score: (s) => anc(s, 'lips')?.score,
    metrics: (s) => ({ hydration: anc(s, 'lips')?.metricVal ?? null }),
    items: [
      { key: 'exfoliate', label: 'Exfoliate' },
      { key: 'balm', label: 'Balm' },
      { key: 'mask', label: 'Overnight Mask' },
    ],
  },
  scalp: {
    score: (s) => anc(s, 'hair')?.score,
    metrics: (s) => {
      const hair = anc(s, 'hair');
      return {
        density: hair?.metricVal ?? null,
        dryness: hair?.extras?.dryness ?? null,
        oiliness: hair?.extras?.oiliness ?? null,
        flakiness: hair?.extras?.flakiness ?? null,
      };
    },
    items: [
      { key: 'wash', label: 'Hair Wash' },
      { key: 'serum', label: 'Scalp Serum' },
      { key: 'massage', label: 'Scalp Massage' },
      { key: 'mask', label: 'Deep Conditioning Mask' },
    ],
  },
};

const HISTORY_LENGTH = 8;

async function get(req, res) {
  const area = AREAS[req.params.area];
  if (!area) return res.status(404).json({ error: 'Unknown tracker' });

  const { data: scans, error } = await supabase
    .from('scans')
    .select('id, created_at, zones_json, ancillary_json')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);

  // Older scans may predate a metric (e.g. lash scores) — skip those.
  const scored = (scans || [])
    .map((s) => ({ scan: s, score: area.score(s) }))
    .filter((s) => typeof s.score === 'number');
  const latest = scored[0] || null;
  const previous = scored[1] || null;
  const first = scored[scored.length - 1] || null;

  const byItem = await checks.getChecks(req.userId, req.params.area);
  const today = todayStr();
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, doneKeys: area.items.filter((it) => byItem[it.key]?.has(date)).map((it) => it.key) };
  });

  return res.json({
    area: req.params.area,
    score: latest?.score ?? null,
    previousScore: previous?.score ?? null,
    firstScore: first?.score ?? null,
    change: latest && previous ? latest.score - previous.score : null,
    scanCount: scored.length,
    firstScanAt: first?.scan.created_at ?? null,
    lastScanAt: latest?.scan.created_at ?? null,
    metrics: latest ? area.metrics(latest.scan) : null,
    history: scored.slice(0, HISTORY_LENGTH).reverse()
      .map(({ scan, score }) => ({ id: scan.id, date: scan.created_at, score })),
    items: area.items.map((it) => ({ ...it, ...checks.summarize(byItem[it.key]) })),
    week,
  });
}

async function setCheck(req, res) {
  const area = AREAS[req.params.area];
  if (!area) return res.status(404).json({ error: 'Unknown tracker' });
  const { itemKey, done } = req.body || {};
  if (!area.items.some((it) => it.key === itemKey) || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'A valid itemKey and boolean done are required' });
  }
  await checks.setCheck(req.userId, req.params.area, itemKey, done);
  const byItem = await checks.getChecks(req.userId, req.params.area);
  return res.json({ items: area.items.map((it) => ({ ...it, ...checks.summarize(byItem[it.key]) })) });
}

module.exports = { get, setCheck };
