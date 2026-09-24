const { supabase } = require('../db/database');

// Returns global leaderboard ranked by total points
async function getLeaderboard(req, res) {
  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name');
  if (usersError) throw new Error(usersError.message);

  // Get all points
  const { data: points, error: pointsError } = await supabase
    .from('points_ledger')
    .select('user_id, points');
  if (pointsError) throw new Error(pointsError.message);

  // Get streaks (routine finishes)
  const { data: finishes, error: finishesError } = await supabase
    .from('routine_finishes')
    .select('user_id, date');
  if (finishesError) throw new Error(finishesError.message);

  // Aggregate points per user
  const pointsMap = {};
  for (const p of points || []) {
    pointsMap[p.user_id] = (pointsMap[p.user_id] || 0) + p.points;
  }

  // Compute streak per user (count distinct dates, simple consecutive check)
  const finishMap = {};
  for (const f of finishes || []) {
    if (!finishMap[f.user_id]) finishMap[f.user_id] = new Set();
    finishMap[f.user_id].add(f.date);
  }

  // Build ranked list
  const ranked = (users || []).map((u) => ({
    id: u.id,
    name: u.name,
    score: pointsMap[u.id] || 0,
    streak: finishMap[u.id] ? finishMap[u.id].size : 0,
  }));

  // Sort by score desc
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((u, i) => { u.rank = i + 1; });

  // Find current user's position
  const me = ranked.find((u) => u.id === req.userId);

  return res.json({ leaderboard: ranked.slice(0, 50), me: me || null });
}

module.exports = { getLeaderboard };
