const { supabase } = require('../db/database');
const { HttpError } = require('../utils/httpError');

// Each top-level key is a namespace owned by one screen. PATCH merges per
// namespace, so screens never overwrite each other's settings.
const DEFAULTS = {
  coachStyle: { personality: 'motivational', dailyReminders: true, morningInsight: false },
  teenControls: { enabled: false, publicProfile: false, aiInteractions: true, restrictExplicit: true, weeklyEmail: true },
  undereye: { screenBreakReminders: false },
  styles: { brow: null, lash: null, hair: null },
  eyebrow: { goal: 'Full Arch' },
  allergies: { ingredients: ['linalool'] },
  // Daily routine reminder times, 24h "HH:MM".
  reminders: { morning: '07:30', evening: '22:00' },
  // Accounts from before onboarding existed have no stored value, so they
  // default to completed; signup stores `completed: false` for new users.
  onboarding: { completed: true, completedAt: null },
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_PREFS_BYTES = 8000;
const MAX_ALLERGIES = 30;

// Type checks for settings other code relies on; returns an error or null.
function invalidValue(ns, key, value) {
  if (ns === 'reminders' && !TIME_RE.test(value)) return `reminders.${key} must be a 24h time like 07:30`;
  if (ns === 'allergies' && key === 'ingredients') {
    const ok = Array.isArray(value) && value.length <= MAX_ALLERGIES
      && value.every((v) => typeof v === 'string' && v.trim() && v.length <= 40);
    if (!ok) return `allergies.ingredients must be a list of up to ${MAX_ALLERGIES} ingredient names`;
  }
  if (ns === 'onboarding' && key === 'completed' && typeof value !== 'boolean') return 'onboarding.completed must be true or false';
  if (ns === 'onboarding' && key === 'completedAt' && value !== null && Number.isNaN(Date.parse(value))) {
    return 'onboarding.completedAt must be a date';
  }
  return null;
}

function withDefaults(stored = {}) {
  const out = {};
  for (const [ns, defaults] of Object.entries(DEFAULTS)) {
    out[ns] = { ...defaults, ...(stored[ns] || {}) };
  }
  return out;
}

async function loadPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('prefs_json')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return withDefaults(data?.prefs_json);
}

// Merges `patch` ({ section: { key: value } }) into the stored preferences.
async function savePreferences(userId, patch) {
  const current = await loadPreferences(userId);
  const next = { ...current };
  for (const [ns, values] of Object.entries(patch)) {
    next[ns] = { ...current[ns], ...values };
  }
  if (JSON.stringify(next).length > MAX_PREFS_BYTES) {
    throw new HttpError(400, 'Preferences are too large');
  }

  const { error } = await supabase.from('user_preferences').upsert(
    { user_id: userId, prefs_json: next, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(error.message);
  return next;
}

async function get(req, res) {
  return res.json({ preferences: await loadPreferences(req.userId) });
}

async function update(req, res) {
  const patch = req.body || {};
  if (typeof patch !== 'object' || Array.isArray(patch)) {
    return res.status(400).json({ error: 'Body must be an object of preference sections' });
  }
  for (const [ns, values] of Object.entries(patch)) {
    if (!DEFAULTS[ns]) return res.status(400).json({ error: `Unknown preference section: ${ns}` });
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      return res.status(400).json({ error: `Section ${ns} must be an object` });
    }
    for (const key of Object.keys(values)) {
      if (!(key in DEFAULTS[ns])) return res.status(400).json({ error: `Unknown setting: ${ns}.${key}` });
      const invalid = invalidValue(ns, key, values[key]);
      if (invalid) return res.status(400).json({ error: invalid });
    }
  }

  return res.json({ preferences: await savePreferences(req.userId, patch) });
}

module.exports = { get, update, loadPreferences, savePreferences };
