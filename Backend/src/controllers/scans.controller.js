const { supabase } = require('../db/database');
const rewards = require('../services/rewards.service');
const { analyzeFace } = require('../services/faceAnalysis.service');
const { WINDOW, skinScoreOf, withSkinTrend } = require('../services/skinTrend.service');

// `olderRows` = this user's scans taken before `row`, newest first. The skin
// trend is rebuilt from them so it always matches the real scan history.
function toPublic(row, olderRows = []) {
  const olderScores = olderRows.map((r) => skinScoreOf(r.zones_json)).filter((n) => n !== null);
  return {
    id: row.id,
    createdAt: row.created_at,
    zones: withSkinTrend(row.zones_json || [], olderScores),
    ancillary: row.ancillary_json,
  };
}

// The scans (newest first) taken before `createdAt`, enough to fill the trend.
async function olderScans(userId, createdAt) {
  let query = supabase
    .from('scans')
    .select('zones_json, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(WINDOW - 1);
  if (createdAt) query = query.lt('created_at', createdAt);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function create(req, res) {
  const scan = await analyzeFace(req.body?.image);

  const { error } = await supabase.from('scans').insert({
    id: scan.id,
    user_id: req.userId,
    created_at: scan.createdAt,
    zones_json: scan.zones,
    ancillary_json: scan.ancillary,
  });
  if (error) throw new Error(error.message);

  // +50 for the first scan of the day; a referred user's first scan also
  // pays their referrer.
  const pointsAwarded = await rewards.awardScan(req.userId);
  await rewards.rewardReferrer(req.userId);

  const older = await olderScans(req.userId, scan.createdAt);
  const saved = toPublic(
    { id: scan.id, created_at: scan.createdAt, zones_json: scan.zones, ancillary_json: scan.ancillary },
    older,
  );
  return res.status(201).json({ ...saved, pointsAwarded });
}

const LIST_LIMIT = 50;

async function list(req, res) {
  // Fetch a couple of extra rows so the oldest listed scans still get a full trend.
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(LIST_LIMIT + WINDOW - 1);
  if (error) throw new Error(error.message);
  const rows = data || [];
  const scans = rows.slice(0, LIST_LIMIT).map((row, i) => toPublic(row, rows.slice(i + 1)));
  return res.json({ scans });
}

async function getOne(req, res) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Scan not found' });
  return res.json(toPublic(data, await olderScans(req.userId, data.created_at)));
}

module.exports = { create, list, getOne };
