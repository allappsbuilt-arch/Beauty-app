const { query } = require('../db/database');
const { todayStr } = require('../services/date.util');

const VALID_FEELINGS = new Set(['happy', 'dry', 'glow', 'soft', 'red', 'oily', null]);

async function upsert(req, res) {
  const { feeling } = req.body || {};
  const normalized = feeling || null;
  if (!VALID_FEELINGS.has(normalized)) {
    return res.status(400).json({ error: 'Invalid feeling' });
  }

  await query(
    `INSERT INTO checkins (user_id, date, feeling) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET feeling = excluded.feeling`,
    [req.userId, todayStr(), normalized]
  );

  return res.json({ feeling: normalized });
}

async function getToday(req, res) {
  const { rows } = await query(
    'SELECT feeling FROM checkins WHERE user_id = $1 AND date = $2',
    [req.userId, todayStr()]
  );
  return res.json({ feeling: rows[0]?.feeling ?? null });
}

module.exports = { upsert, getToday };
