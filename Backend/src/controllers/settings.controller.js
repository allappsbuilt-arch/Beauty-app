const { query } = require('../db/database');

const DEFAULT_CATEGORIES = {
  routine: true,
  progress: true,
  social: false,
  community: true,
  coach: true,
  wellness: false,
};

async function getRow(userId) {
  const { rows } = await query('SELECT * FROM notification_prefs WHERE user_id = $1', [userId]);
  if (rows[0]) return rows[0];

  await query(
    'INSERT INTO notification_prefs (user_id, mute_all, categories_json) VALUES ($1, FALSE, $2)',
    [userId, JSON.stringify(DEFAULT_CATEGORIES)]
  );

  const { rows: inserted } = await query('SELECT * FROM notification_prefs WHERE user_id = $1', [userId]);
  return inserted[0];
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

  await query(
    'UPDATE notification_prefs SET mute_all = $1, categories_json = $2 WHERE user_id = $3',
    [nextMuteAll, JSON.stringify(nextCategories), req.userId]
  );

  return res.json({ muteAll: nextMuteAll, categories: nextCategories });
}

module.exports = { getNotifications, updateNotifications };
