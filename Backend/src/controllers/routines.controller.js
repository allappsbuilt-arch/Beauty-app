const { supabase } = require('../db/database');
const points = require('../services/points.service');
const { todayStr, addDays, isDateStr, mondayFirstIndex, startOfWeek } = require('../services/date.util');
const { ROUTINE_STEP_KEYS, LEGACY_PM_KEYS, normalizeStepKey } = require('../services/routineSteps');

const VALID_PERIODS = new Set(['AM', 'PM']);
const ROUTINE_POINTS = 10;

async function completedStepKeysToday(userId, period, date) {
  const { data, error } = await supabase
    .from('routine_step_completions')
    .select('step_key')
    .eq('user_id', userId)
    .eq('period', period)
    .eq('date', date);
  if (error) throw new Error(error.message);
  // Legacy PM keys count as their new PM step; unknown keys are ignored so
  // counts never exceed the total. Order follows the routine.
  const done = new Set((data || []).map((r) => normalizeStepKey(period, r.step_key)).filter(Boolean));
  return ROUTINE_STEP_KEYS[period].filter((k) => done.has(k));
}

async function isFinished(userId, date) {
  const { data, error } = await supabase
    .from('routine_finishes')
    .select('date')
    .eq('user_id', userId)
    .eq('date', date)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data || []).length > 0;
}

async function computeStreak(userId) {
  const { data, error } = await supabase
    .from('routine_finishes')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);

  const dates = new Set((data || []).map((r) => r.date));
  if (dates.size === 0) return 0;

  let cursor = todayStr();
  if (!dates.has(cursor)) {
    cursor = addDays(cursor, -1);
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

  const { data, error } = await supabase
    .from('routine_finishes')
    .select('date')
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', weekEnd);
  if (error) throw new Error(error.message);

  return (data || []).map((r) => mondayFirstIndex(r.date));
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
  const key = normalizeStepKey(upperPeriod, stepKey);
  if (!key) {
    // An older app's PM "spf" step has no PM equivalent — accept it as a no-op.
    if (upperPeriod === 'PM' && stepKey in LEGACY_PM_KEYS) {
      return res.json({ completedStepKeys: await completedStepKeysToday(req.userId, upperPeriod, date) });
    }
    return res.status(400).json({ error: `Unknown ${upperPeriod} step: ${stepKey}` });
  }

  const { error } = await supabase.from('routine_step_completions').upsert(
    { user_id: req.userId, period: upperPeriod, step_key: key, date, completed_at: new Date().toISOString() },
    { onConflict: 'user_id,period,step_key,date', ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);

  return res.json({ completedStepKeys: await completedStepKeysToday(req.userId, upperPeriod, date) });
}

async function finish(req, res) {
  const { period } = req.body || {};
  if (!period || !VALID_PERIODS.has(String(period).toUpperCase())) {
    return res.status(400).json({ error: 'period (AM|PM) is required' });
  }
  const date = todayStr();
  const upperPeriod = String(period).toUpperCase();

  // A routine only counts toward the streak once every step is done.
  const done = await completedStepKeysToday(req.userId, upperPeriod, date);
  const remaining = ROUTINE_STEP_KEYS[upperPeriod].filter((k) => !done.includes(k));
  if (remaining.length > 0) {
    return res.status(400).json({
      error: `Complete the remaining ${remaining.length} step${remaining.length === 1 ? '' : 's'} first`,
      remaining,
    });
  }

  const { data, error } = await supabase
    .from('routine_finishes')
    .upsert(
      { user_id: req.userId, date, created_at: new Date().toISOString() },
      { onConflict: 'user_id,date', ignoreDuplicates: true }
    )
    .select();
  if (error) throw new Error(error.message);

  // Only award points if a new row was actually inserted
  const pointsAwarded = data && data.length > 0 ? ROUTINE_POINTS : 0;
  if (pointsAwarded) {
    await points.award(req.userId, 'Daily Routine Completed', pointsAwarded);
  }

  return res.json({ streak: await computeStreak(req.userId), pointsAwarded });
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
    date,
    am: { completedToday: amKeys.length, completedStepKeys: amKeys, total: ROUTINE_STEP_KEYS.AM.length },
    pm: { completedToday: pmKeys.length, completedStepKeys: pmKeys, total: ROUTINE_STEP_KEYS.PM.length },
    streak,
    weekDoneIndices: weekDone,
  });
}

// Progress for any single day (week strip selection).
async function day(req, res) {
  const date = req.query.date;
  if (!isDateStr(date)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }
  const [amKeys, pmKeys, finished] = await Promise.all([
    completedStepKeysToday(req.userId, 'AM', date),
    completedStepKeysToday(req.userId, 'PM', date),
    isFinished(req.userId, date),
  ]);
  return res.json({
    date,
    isToday: date === todayStr(),
    finished,
    am: { completedToday: amKeys.length, completedStepKeys: amKeys, total: ROUTINE_STEP_KEYS.AM.length },
    pm: { completedToday: pmKeys.length, completedStepKeys: pmKeys, total: ROUTINE_STEP_KEYS.PM.length },
  });
}

module.exports = { today, completeStep, finish, summary, day };
