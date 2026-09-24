const { query } = require('../db/database');

const LEVELS = [
  { min: 0, label: 'Level 1: Fresh Start' },
  { min: 500, label: 'Level 2: Glow Getter' },
  { min: 1500, label: 'Level 3: Radiance Rookie' },
  { min: 3000, label: 'Level 4: Skin Savant' },
  { min: 6000, label: 'Level 5: Glow Master' },
  { min: 10000, label: 'Level 6: Luminary' },
];

async function award(userId, label, points) {
  await query(
    'INSERT INTO points_ledger (user_id, label, points, created_at) VALUES ($1, $2, $3, $4)',
    [userId, label, points, new Date().toISOString()]
  );
}

async function getBalance(userId) {
  const { rows } = await query(
    'SELECT COALESCE(SUM(points), 0) AS balance FROM points_ledger WHERE user_id = $1',
    [userId]
  );
  return Number(rows[0].balance);
}

async function getHistory(userId, limit = 50) {
  const { rows } = await query(
    'SELECT id, label, points, created_at FROM points_ledger WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2',
    [userId, limit]
  );
  return rows;
}

function getLevelInfo(balance) {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (balance >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  return {
    levelLabel: current.label,
    nextLevelLabel: next ? next.label : null,
    levelGoal: next ? next.min : current.min,
  };
}

module.exports = { award, getBalance, getHistory, getLevelInfo };
