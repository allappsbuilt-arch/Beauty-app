const { supabase } = require('../db/database');
const { todayStr } = require('../services/date.util');

const VALID_FEELINGS = new Set(['happy', 'dry', 'glow', 'soft', 'red', 'oily', null]);

async function upsert(req, res) {
  const { feeling } = req.body || {};
  const normalized = feeling || null;
  if (!VALID_FEELINGS.has(normalized)) {
    return res.status(400).json({ error: 'Invalid feeling' });
  }

  const { error } = await supabase.from('checkins').upsert(
    { user_id: req.userId, date: todayStr(), feeling: normalized },
    { onConflict: 'user_id,date' }
  );
  if (error) throw new Error(error.message);

  return res.json({ feeling: normalized });
}

async function getToday(req, res) {
  const { data, error } = await supabase
    .from('checkins')
    .select('feeling')
    .eq('user_id', req.userId)
    .eq('date', todayStr())
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return res.json({ feeling: data?.feeling ?? null });
}

module.exports = { upsert, getToday };
