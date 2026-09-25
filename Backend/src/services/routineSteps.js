// Step keys for each routine. Must match Frontend/src/data/routineSteps.js —
// the backend uses them to validate completions and to decide when a routine
// is really finished (which is what counts toward the streak).
const ROUTINE_STEP_KEYS = {
  AM: ['cleanser', 'toner', 'serum', 'eye', 'moisturizer', 'spf'],
  PM: ['pm_cleanse', 'pm_toner', 'pm_treatment', 'pm_eye', 'pm_night_cream'],
};

// Before the PM routine had its own steps it reused the AM list, so older PM
// completions are stored under AM key names. Map them to the matching PM step
// by position (the AM "spf" step has no evening equivalent and is dropped).
// Applied when reading and when an older app version sends an old key —
// stored rows are never rewritten.
const LEGACY_PM_KEYS = {
  cleanser: 'pm_cleanse',
  toner: 'pm_toner',
  serum: 'pm_treatment',
  eye: 'pm_eye',
  moisturizer: 'pm_night_cream',
  spf: null,
};

// Current step key for a stored/submitted one, or null if it isn't a step
// of that routine.
function normalizeStepKey(period, key) {
  if (ROUTINE_STEP_KEYS[period]?.includes(key)) return key;
  if (period === 'PM' && key in LEGACY_PM_KEYS) return LEGACY_PM_KEYS[key];
  return null;
}

module.exports = { ROUTINE_STEP_KEYS, LEGACY_PM_KEYS, normalizeStepKey };
