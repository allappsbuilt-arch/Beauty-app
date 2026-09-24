const { supabase } = require('../db/database');
const points = require('../services/points.service');
const { todayStr, addDays, mondayFirstIndex, startOfWeek } = require('../services/date.util');

const VALID_PERIODS = new Set(['AM', 'PM']);

async function completedStepKeysToday(userId, period, date) {
  const { data, error } = await supabase
    .from('routine_step_completions')
    .select('step_key')
    .eq('user_id', userId)
    .eq('period', period)
    .eq('date', date);
  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.step_key);
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

  const { error } = await supabase.from('routine_step_completions').upsert(
    { user_id: req.userId, period: upperPeriod, step_key: stepKey, date, completed_at: new Date().toISOString() },
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

  const { data, error } = await supabase
    .from('routine_finishes')
    .upsert(
      { user_id: req.userId, date, created_at: new Date().toISOString() },
      { onConflict: 'user_id,date', ignoreDuplicates: true }
    )
    .select();
  if (error) throw new Error(error.message);

  // Only award points if a new row was actually inserted
  if (data && data.length > 0) {
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
