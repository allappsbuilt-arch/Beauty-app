import { translate as tr } from '../i18n';

// Face-scan results come from the backend in English. The labels below are a
// fixed set (see Backend/src/services/faceAnalysis.service.js and
// skinTrend.service.js), so the app translates them here; anything unknown —
// such as the AI's free-text insight — is shown as sent.

const ZONES = {
  skin: 'scanText.zones.skin',
  eyes: 'scanText.zones.eyes',
  lips: 'scanText.zones.lips',
  hair: 'scanText.zones.hair',
  brows: 'scanText.zones.brows',
};

const METRICS = {
  'Hydration Level': 'scanText.metrics.hydrationLevel',
  'Pore Clarity': 'scanText.metrics.poreClarity',
  Elasticity: 'scanText.metrics.elasticity',
  'Dark Circles': 'scanText.metrics.darkCircles',
  Puffiness: 'scanText.metrics.puffiness',
  Hydration: 'scanText.metrics.hydration',
  Density: 'scanText.metrics.density',
  Fullness: 'scanText.metrics.fullness',
};

// Condition values, matched case-insensitively.
const STATUSES = {
  OPTIMAL: 'scanText.status.optimal',
  EXCELLENT: 'scanText.status.excellent',
  GOOD: 'scanText.status.good',
  FAIR: 'scanText.status.fair',
  LOW: 'scanText.status.low',
  MODERATE: 'scanText.status.moderate',
  HIGH: 'scanText.status.high',
  DRY: 'scanText.status.dry',
  FULL: 'scanText.status.full',
  SPARSE: 'scanText.status.sparse',
  'NOT VISIBLE': 'scanText.status.notVisible',
  MILD: 'scanText.status.mild',
  BALANCED: 'scanText.status.balanced',
  OILY: 'scanText.status.oily',
  NONE: 'scanText.status.none',
  VISIBLE: 'scanText.status.visible',
};

export const zoneName = (zone) => (ZONES[zone?.key] ? tr(ZONES[zone.key]) : zone?.title ?? zone?.label ?? '');

export const metricName = (label) => (METRICS[label] ? tr(METRICS[label]) : label);

export function statusName(value) {
  const key = STATUSES[String(value ?? '').toUpperCase()];
  return key ? tr(key) : value;
}

export function trendLabel(label) {
  const m = /^(\d+)-SCAN TREND$/i.exec(label || '');
  if (m) return tr('scanText.trendLabel', { count: Number(m[1]) });
  if (/^FIRST SCAN$/i.test(label || '')) return tr('scanText.firstScan');
  return label;
}

export function trendMessage(message) {
  if (!message) return message;
  if (/^Not enough scans for trend$/i.test(message)) return tr('scanText.notEnoughScans');
  const m = /^(\d+) more scans? for a full (\d+)-scan trend$/i.exec(message);
  if (m) return tr('scanText.moreScans', { count: Number(m[1]), total: Number(m[2]) });
  return message;
}
