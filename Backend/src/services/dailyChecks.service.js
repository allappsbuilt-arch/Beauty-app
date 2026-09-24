const { supabase } = require('../db/database');
const { todayStr, addDays } = require('./date.util');

// Generic "did X today" log, keyed by (area, item). Used by the trackers'
// checklists and by the product shelf's usage streaks.

async function getChecks(userId, area) {
  const { data, error } = await supabase
    .from('tracker_checks')
    .select('item_key, date')
    .eq('user_id', userId)
    .eq('area', area);
  if (error) throw new Error(error.message);
  const byItem = {};
  for (const row of data || []) {
    (byItem[row.item_key] ||= new Set()).add(row.date);
  }
  return byItem;
}

async function setCheck(userId, area, itemKey, done) {
  const date = todayStr();
  if (done) {
    const { error } = await supabase.from('tracker_checks').upsert(
      { user_id: userId, area, item_key: itemKey, date },
      { onConflict: 'user_id,area,item_key,date', ignoreDuplicates: true }
    );
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('tracker_checks')
      .delete()
      .eq('user_id', userId)
      .eq('area', area)
      .eq('item_key', itemKey)
      .eq('date', date);
    if (error) throw new Error(error.message);
  }
}

// Consecutive days ending today (or yesterday, so a streak isn't "lost"
// before the user has had a chance to log today).
function streakFromDates(dates) {
  if (!dates || dates.size === 0) return 0;
  let cursor = todayStr();
  if (!dates.has(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function summarize(dates) {
  const set = dates || new Set();
  return { doneToday: set.has(todayStr()), streak: streakFromDates(set), totalDays: set.size };
}

module.exports = { getChecks, setCheck, streakFromDates, summarize };
