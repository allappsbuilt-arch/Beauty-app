const { supabase } = require('../db/database');
const points = require('./points.service');
const { todayStr } = require('./date.util');
const { HttpError } = require('../utils/httpError');

// Earn rules shown on the Earn screen. Every reward is paid at most once per
// key: a unique tracker_checks row (area "rewards") is written first, and
// points are only awarded when that insert actually created the row — so
// double taps, retries or concurrent requests can't pay twice.
const RULES = {
  scan: { points: 50, label: 'Skin Analysis' },           // first face scan each day
  water: { points: 20, label: 'Daily Water Goal' },       // reaching the daily glasses goal
  referral: { points: 500, label: 'Friend Joined' },      // a referred friend completes their first scan or routine
};
const WATER_GOAL = 8;
const WATER_MAX = 12;
const ONCE = 'once'; // tracker_checks.date value for lifetime (not daily) rewards

async function awardOnce(userId, key, date, label, amount) {
  const { data, error } = await supabase
    .from('tracker_checks')
    .upsert({ user_id: userId, area: 'rewards', item_key: key, date }, { onConflict: 'user_id,area,item_key,date', ignoreDuplicates: true })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return 0; // already awarded
  await points.award(userId, label, amount);
  return amount;
}

async function hasReward(userId, key, date) {
  const { data, error } = await supabase
    .from('tracker_checks').select('item_key')
    .eq('user_id', userId).eq('area', 'rewards').eq('item_key', key).eq('date', date).limit(1);
  if (error) throw new Error(error.message);
  return (data || []).length > 0;
}

// ─── Scan ───────────────────────────────────────────────────────────────────

function awardScan(userId) {
  return awardOnce(userId, 'scan', todayStr(), RULES.scan.label, RULES.scan.points);
}

// ─── Water ──────────────────────────────────────────────────────────────────

async function waterGlasses(userId, date = todayStr()) {
  const { data, error } = await supabase
    .from('tracker_checks').select('item_key')
    .eq('user_id', userId).eq('area', 'water').eq('date', date);
  if (error) throw new Error(error.message);
  return (data || []).length;
}

async function waterStatus(userId) {
  const today = todayStr();
  const [glasses, rewarded] = await Promise.all([waterGlasses(userId, today), hasReward(userId, 'water_goal', today)]);
  return { glasses, goal: WATER_GOAL, max: WATER_MAX, rewarded, points: RULES.water.points };
}

// delta: +1 (add a glass) or -1 (undo the last one).
async function changeWater(userId, delta) {
  const today = todayStr();
  const count = await waterGlasses(userId, today);
  let pointsAwarded = 0;
  if (delta > 0) {
    if (count >= WATER_MAX) throw new HttpError(400, `You can log up to ${WATER_MAX} glasses a day`);
    // glass_<n> is unique per day, so a double tap can't add two glasses.
    const { error } = await supabase.from('tracker_checks').upsert(
      { user_id: userId, area: 'water', item_key: `glass_${count + 1}`, date: today },
      { onConflict: 'user_id,area,item_key,date', ignoreDuplicates: true }
    );
    if (error) throw new Error(error.message);
    if (count + 1 >= WATER_GOAL) {
      pointsAwarded = await awardOnce(userId, 'water_goal', today, RULES.water.label, RULES.water.points);
    }
  } else if (count > 0) {
    const { error } = await supabase.from('tracker_checks').delete()
      .eq('user_id', userId).eq('area', 'water').eq('item_key', `glass_${count}`).eq('date', today);
    if (error) throw new Error(error.message);
  }
  return { ...(await waterStatus(userId)), pointsAwarded };
}

// ─── Referrals ──────────────────────────────────────────────────────────────
// A user's code is the first 8 characters of their (random UUID) id.

function referralCode(userId) {
  return String(userId).replace(/-/g, '').slice(0, 8).toUpperCase();
}

async function findReferrer(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (!/^[0-9A-F]{8}$/.test(clean)) return null;
  const { data, error } = await supabase.from('users').select('id, name').ilike('id', `${clean.toLowerCase()}%`).limit(2);
  if (error) throw new Error(error.message);
  return data && data.length === 1 ? data[0] : null;
}

// Called at signup: remembers who referred the new user.
async function recordReferral(newUserId, referrerId) {
  const { error } = await supabase.from('tracker_checks').upsert(
    { user_id: newUserId, area: 'referred_by', item_key: referrerId, date: ONCE },
    { onConflict: 'user_id,area,item_key,date', ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);
}

// Called after the user's first scan / routine: pays the referrer once.
async function rewardReferrer(userId) {
  const { data, error } = await supabase
    .from('tracker_checks').select('item_key').eq('user_id', userId).eq('area', 'referred_by').limit(1);
  if (error) throw new Error(error.message);
  const referrerId = data?.[0]?.item_key;
  if (!referrerId || referrerId === userId) return 0;
  const { data: users } = await supabase.from('users').select('id, name').eq('id', userId).limit(1);
  const name = users?.[0]?.name?.split(' ')[0] || 'a friend';
  return awardOnce(referrerId, `referral:${userId}`, ONCE, `${RULES.referral.label}: ${name}`, RULES.referral.points);
}

async function referralStatus(userId) {
  const { data, error } = await supabase
    .from('tracker_checks').select('user_id').eq('area', 'referred_by').eq('item_key', userId);
  if (error) throw new Error(error.message);
  const friendIds = (data || []).map((r) => r.user_id);
  let friends = [];
  if (friendIds.length) {
    const [{ data: users }, { data: paid }] = await Promise.all([
      supabase.from('users').select('id, name, created_at').in('id', friendIds),
      supabase.from('tracker_checks').select('item_key').eq('user_id', userId).eq('area', 'rewards').eq('date', ONCE)
        .in('item_key', friendIds.map((id) => `referral:${id}`)),
    ]);
    const paidSet = new Set((paid || []).map((p) => p.item_key));
    friends = (users || []).map((u) => ({
      name: u.name.split(' ')[0],
      joinedAt: u.created_at,
      rewarded: paidSet.has(`referral:${u.id}`),
    })).sort((a, b) => String(b.joinedAt).localeCompare(String(a.joinedAt)));
  }
  return {
    code: referralCode(userId),
    points: RULES.referral.points,
    friends,
    pointsEarned: friends.filter((f) => f.rewarded).length * RULES.referral.points,
  };
}

module.exports = {
  RULES, WATER_GOAL, awardOnce, awardScan, waterStatus, changeWater,
  referralCode, findReferrer, recordReferral, rewardReferrer, referralStatus, hasReward,
};
