const { supabase } = require('../db/database');

const DEFAULT_CATEGORIES = {
  routine: true,
  progress: true,
  social: false,
  community: true,
  coach: true,
  wellness: false,
};

async function getRow(userId) {
  const { data, error } = await supabase
    .from('notification_prefs')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) return data;

  // Row doesn't exist yet — insert defaults
  if (error && error.code === 'PGRST116') {
    const { data: inserted, error: insertError } = await supabase
      .from('notification_prefs')
      .insert({ user_id: userId, mute_all: false, categories_json: DEFAULT_CATEGORIES })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);
    return inserted;
  }

  throw new Error(error.message);
}

function toPublic(row) {
  return { muteAll: !!row.mute_all, categories: row.categories_json };
}

async function getNotifications(req, res) {
  return res.json(toPublic(await getRow(req.userId)));
}

async function updateNotifications(req, res) {
  const current = toPublic(await getRow(req.userId));
  const { muteAll, categories } = req.body || {};

  const nextMuteAll = typeof muteAll === 'boolean' ? muteAll : current.muteAll;
  const nextCategories = categories && typeof categories === 'object'
    ? { ...current.categories, ...categories }
    : current.categories;

  const { error } = await supabase
    .from('notification_prefs')
    .update({ mute_all: nextMuteAll, categories_json: nextCategories })
    .eq('user_id', req.userId);
  if (error) throw new Error(error.message);

  return res.json({ muteAll: nextMuteAll, categories: nextCategories });
}

module.exports = { getNotifications, updateNotifications };
