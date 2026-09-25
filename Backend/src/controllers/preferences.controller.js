const { supabase } = require('../db/database');

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
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_PREFS_BYTES = 8000;

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
      if (ns === 'reminders' && !TIME_RE.test(values[key])) {
        return res.status(400).json({ error: `reminders.${key} must be a 24h time like 07:30` });
      }
    }
  }

  const current = await loadPreferences(req.userId);
  const next = { ...current };
  for (const [ns, values] of Object.entries(patch)) {
    next[ns] = { ...current[ns], ...values };
  }
  if (JSON.stringify(next).length > MAX_PREFS_BYTES) {
    return res.status(400).json({ error: 'Preferences are too large' });
  }

  const { error } = await supabase.from('user_preferences').upsert(
    { user_id: req.userId, prefs_json: next, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(error.message);

  return res.json({ preferences: next });
}

module.exports = { get, update, loadPreferences };
