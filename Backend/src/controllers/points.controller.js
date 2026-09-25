const points = require('../services/points.service');
const rewards = require('../services/rewards.service');
const { todayStr } = require('../services/date.util');

const PAGE_MAX = 100;

async function summary(req, res) {
  const balance = await points.getBalance(req.userId);
  const { levelLabel, nextLevelLabel, levelFloor, levelGoal } = points.getLevelInfo(balance);
  return res.json({
    balance,
    levelLabel,
    nextLevelLabel,
    levelFloor,
    levelGoal,
    pointsToNext: nextLevelLabel ? Math.max(0, levelGoal - balance) : 0,
  });
}

// ?limit=&before=<ISO> — newest first; nextCursor pages further back.
async function history(req, res) {
  const limit = Math.min(PAGE_MAX, Math.max(1, Number(req.query.limit) || 50));
  const before = typeof req.query.before === 'string' && !Number.isNaN(Date.parse(req.query.before)) ? req.query.before : null;
  const rows = await points.getHistory(req.userId, limit + 1, before);
  const page = rows.slice(0, limit);
  return res.json({
    history: page.map((r) => ({ id: r.id, label: r.label, points: r.points, createdAt: r.created_at })),
    nextCursor: rows.length > limit ? page[page.length - 1].created_at : null,
  });
}

// Everything the Earn cards need: what's already been earned today.
async function earnStatus(req, res) {
  const [scanDone, water, referral] = await Promise.all([
    rewards.hasReward(req.userId, 'scan', todayStr()),
    rewards.waterStatus(req.userId),
    rewards.referralStatus(req.userId),
  ]);
  return res.json({
    scan: { points: rewards.RULES.scan.points, doneToday: scanDone },
    water,
    referral,
  });
}

async function water(req, res) {
  return res.json(await rewards.waterStatus(req.userId));
}

async function changeWater(req, res) {
  const delta = req.body?.delta === -1 ? -1 : 1;
  return res.json(await rewards.changeWater(req.userId, delta));
}

async function referral(req, res) {
  return res.json(await rewards.referralStatus(req.userId));
}

module.exports = { summary, history, earnStatus, water, changeWater, referral };
