const points = require('../services/points.service');

async function summary(req, res) {
  const balance = await points.getBalance(req.userId);
  const { levelLabel, nextLevelLabel, levelGoal } = points.getLevelInfo(balance);
  return res.json({ balance, levelLabel, nextLevelLabel, levelGoal });
}

async function history(req, res) {
  const rows = await points.getHistory(req.userId);
  return res.json({
    history: rows.map((r) => ({ id: r.id, label: r.label, points: r.points, createdAt: r.created_at })),
  });
}

module.exports = { summary, history };
