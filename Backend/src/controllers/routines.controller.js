const { query } = require('../db/database');
const points = require('../services/points.service');
const { todayStr, addDays, mondayFirstIndex, startOfWeek } = require('../services/date.util');

const VALID_PERIODS = new Set(['AM', 'PM']);

async function completedStepKeysToday(userId, period, date) {
  const { rows } = await query(
    'SELECT step_key FROM routine_step_completions WHERE user_id = $1 AND period = $2 AND date = $3',
    [userId, period, date]
  );
  return rows.map((r) => r.step_key);
}

async function computeStreak(userId) {
  const { rows } = await query(
    'SELECT DISTINCT date FROM routine_finishes WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  const dates = new Set(rows.map((r) => r.date));
  if (dates.size === 0) return 0;

  let cursor = todayStr();
  if (!dates.has(cursor)) {
    cursor = addDays(cursor, -1); // allow "today not done yet" without breaking the streak
    if (!dates.has(cursor)) return 0;
  }

  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

async function weekDoneIndices(userId) {
  const today = todayStr();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const { rows } = await query(
    'SELECT DISTINCT date FROM routine_finishes WHERE user_id = $1 AND date BETWEEN $2 AND $3',
    [userId, weekStart, weekEnd]
  );
  return rows.map((r) => mondayFirstIndex(r.date));
}

async function today(req, res) {
  const period = String(req.query.period || 'AM').toUpperCase();
  if (!VALID_PERIODS.has(period)) {
    return res.status(400).json({ error: 'period must be AM or PM' });
  }
  const completedStepKeys = await completedStepKeysToday(req.userId, period, todayStr());
  return res.json({ completedStepKeys });
}

async function completeStep(req, res) {
  const { period, stepKey } = req.body || {};
  if (!period || !VALID_PERIODS.has(String(period).toUpperCase()) || !stepKey) {
    return res.status(400).json({ error: 'period (AM|PM) and stepKey are required' });
  }
  const date = todayStr();
  const upperPeriod = period.toUpperCase();
  await query(
    `INSERT INTO routine_step_completions (user_id, period, step_key, date, completed_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, period, step_key, date) DO NOTHING`,
    [req.userId, upperPeriod, stepKey, date, new Date().toISOString()]
  );

  return res.json({ completedStepKeys: await completedStepKeysToday(req.userId, upperPeriod, date) });
}

async function finish(req, res) {
  const { period } = req.body || {};
  if (!period || !VALID_PERIODS.has(String(period).toUpperCase())) {
    return res.status(400).json({ error: 'period (AM|PM) is required' });
  }
  const date = todayStr();

  const result = await query(
    `INSERT INTO routine_finishes (user_id, date, created_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO NOTHING`,
    [req.userId, date, new Date().toISOString()]
  );

  if (result.rowCount > 0) {
    await points.award(req.userId, 'Daily Routine Completed', 10);
  }

  return res.json({ streak: await computeStreak(req.userId) });
}

async function summary(req, res) {
  const date = todayStr();
  const [amKeys, pmKeys, streak, weekDone] = await Promise.all([
    completedStepKeysToday(req.userId, 'AM', date),
    completedStepKeysToday(req.userId, 'PM', date),
    computeStreak(req.userId),
    weekDoneIndices(req.userId),
  ]);
  return res.json({
    am: { completedToday: amKeys.length },
    pm: { completedToday: pmKeys.length },
    streak,
    weekDoneIndices: weekDone,
  });
}

module.exports = { today, completeStep, finish, summary };
