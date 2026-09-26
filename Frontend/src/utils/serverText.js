import { translate as tr } from '../i18n';

// Fixed English labels the backend sends for points and levels (see
// Backend/src/services/points.service.js and rewards.service.js). Known ones
// are translated here; anything else is shown as sent.

const LEVELS = {
  1: 'serverText.levels.l1',
  2: 'serverText.levels.l2',
  3: 'serverText.levels.l3',
  4: 'serverText.levels.l4',
  5: 'serverText.levels.l5',
  6: 'serverText.levels.l6',
};

const LEDGER = {
  'Skin Analysis': 'serverText.ledger.skinAnalysis',
  'Daily Water Goal': 'serverText.ledger.waterGoal',
  'Friend Joined': 'serverText.ledger.friendJoined',
  'Daily Routine Completed': 'serverText.ledger.routineCompleted',
  'Mindfulness Session': 'serverText.ledger.mindfulness',
};

// "Level 2: Glow Getter" → translated full level name.
export function levelName(label) {
  const n = /^Level (\d+):/.exec(label || '')?.[1];
  return LEVELS[n] ? tr(LEVELS[n]) : label;
}

export const ledgerLabel = (label) => (LEDGER[label] ? tr(LEDGER[label]) : label);

// Weekly report "Focus next week" (Backend/src/controllers/weeklyReport.controller.js).
const ZONE_BY_LABEL = { skin: 'scanText.zones.skin', eyes: 'scanText.zones.eyes', lips: 'scanText.zones.lips', hair: 'scanText.zones.hair', brows: 'scanText.zones.brows' };
const zoneFromLabel = (label) => {
  const key = ZONE_BY_LABEL[String(label).toLowerCase()];
  return key ? tr(key) : label;
};

export function weeklyFocusTitle(title) {
  if (title === 'Keep Up Your Routine') return tr('serverText.weekly.keepUpTitle');
  const m = /^Prioritize (.+) Recovery$/.exec(title || '');
  return m ? tr('serverText.weekly.prioritizeTitle', { zone: zoneFromLabel(m[1]) }) : title;
}

export function weeklyFocusDesc(desc) {
  if (desc === 'Consistency is the foundation of skin health. Complete both AM and PM routines daily for the best results.') {
    return tr('serverText.weekly.keepUpDesc');
  }
  const m = /^Focus your care routine on improving your (.+) health this week\.$/.exec(desc || '');
  // Otherwise it's the AI's own insight, shown as sent.
  return m ? tr('serverText.weekly.focusDesc', { zone: zoneFromLabel(m[1]) }) : desc;
}

// Tracker checklist items (Backend/src/controllers/trackers.controller.js), by area + key.
const TRACKER_ITEMS = {
  'eyebrow.revitabrow': 'serverText.trackerItems.eyebrowRevitabrow',
  'eyebrow.castor': 'serverText.trackerItems.eyebrowCastor',
  'eyelash.cleanse': 'serverText.trackerItems.eyelashCleanse',
  'eyelash.spoolie': 'serverText.trackerItems.eyelashSpoolie',
  'undereye.cold': 'serverText.trackerItems.undereyeCold',
  'undereye.gua': 'serverText.trackerItems.undereyeGua',
  'undereye.jade': 'serverText.trackerItems.undereyeJade',
  'undereye.patch': 'serverText.trackerItems.undereyePatch',
  'undereye.eyedrops': 'serverText.trackerItems.undereyeEyedrops',
  'lips.exfoliate': 'serverText.trackerItems.lipsExfoliate',
  'lips.balm': 'serverText.trackerItems.lipsBalm',
  'lips.mask': 'serverText.trackerItems.lipsMask',
  'scalp.wash': 'serverText.trackerItems.scalpWash',
  'scalp.serum': 'serverText.trackerItems.scalpSerum',
  'scalp.massage': 'serverText.trackerItems.scalpMassage',
  'scalp.mask': 'serverText.trackerItems.scalpMask',
};
export const trackerItemLabel = (area, item) => {
  const key = TRACKER_ITEMS[`${area}.${item?.key}`];
  return key ? tr(key) : item?.label;
};

// The eyebrow goal is saved as the chosen brow style's English name.
const BROW_GOALS = {
  'Full Arch': 'browStyles.fullArch',
  'Natural Arch': 'browStyles.natural',
  Feathered: 'browStyles.feathered',
  'Bold & Defined': 'browStyles.bold',
  'Straight Soft': 'browStyles.straight',
  'High Arch': 'browStyles.high',
  'Soft Textured': 'browStyles.soft',
};
export const browGoalLabel = (goal) => (BROW_GOALS[goal] ? tr(BROW_GOALS[goal]) : goal);
