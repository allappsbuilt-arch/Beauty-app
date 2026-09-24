const { supabase } = require('../db/database');

const LEVELS = [
  { min: 0,     label: 'Level 1: Fresh Start' },
  { min: 500,   label: 'Level 2: Glow Getter' },
  { min: 1500,  label: 'Level 3: Radiance Rookie' },
  { min: 3000,  label: 'Level 4: Skin Savant' },
  { min: 6000,  label: 'Level 5: Glow Master' },
  { min: 10000, label: 'Level 6: Luminary' },
];

async function award(userId, label, points) {
  const { error } = await supabase.from('points_ledger').insert({
    user_id: userId,
    label,
    points,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function getBalance(userId) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('points')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, row) => sum + row.points, 0);
}

async function getHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('id, label, points, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
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
