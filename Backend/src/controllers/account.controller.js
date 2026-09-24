const { supabase } = require('../db/database');

// Every table holding user data. Rows cascade-delete with the user, but the
// export needs to read each one explicitly.
const USER_TABLES = [
  'routine_step_completions', 'routine_finishes', 'checkins', 'scans', 'points_ledger',
  'notification_prefs', 'coach_messages', 'makeup_sessions', 'user_preferences',
  'tracker_checks', 'shelf_items', 'product_reviews', 'review_votes',
];

async function exportData(req, res) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('id', req.userId)
    .single();
  if (error || !user) return res.status(404).json({ error: 'User not found' });

  const out = { exportedAt: new Date().toISOString(), user };
  for (const table of USER_TABLES) {
    const { data, error: tErr } = await supabase.from(table).select('*').eq('user_id', req.userId);
    if (tErr) throw new Error(`${table}: ${tErr.message}`);
    out[table] = data || [];
  }
  return res.json(out);
}

async function deleteAccount(req, res) {
  const { confirm } = req.body || {};
  if (confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Send { "confirm": "DELETE" } to delete your account' });
  }
  // Votes on other people's reviews reference this user only by id.
  await supabase.from('review_votes').delete().eq('user_id', req.userId);
  const { error } = await supabase.from('users').delete().eq('id', req.userId);
  if (error) throw new Error(error.message);
  return res.json({ deleted: true });
}

module.exports = { exportData, deleteAccount };
