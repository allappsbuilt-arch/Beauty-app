const { supabase } = require('../db/database');
const { addDays, startOfWeek, todayStr } = require('../services/date.util');

function getWeekDates(startDate) {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

async function getWeeklyReport(req, res) {
  const today = todayStr();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);

  // 1. Routine consistency for the week
  const { data: finishes, error: finishError } = await supabase
    .from('routine_finishes')
    .select('date')
    .eq('user_id', req.userId)
    .gte('date', weekStart)
    .lte('date', weekEnd);
  if (finishError) throw new Error(finishError.message);

  const doneSet = new Set((finishes || []).map((f) => f.date));
  const weekDates = getWeekDates(weekStart);
  const DAY_KEYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const consistency = weekDates.map((date, i) => ({
    key: DAY_KEYS[i],
    date,
    done: doneSet.has(date),
    pct: doneSet.has(date) ? 1.0 : 0.0,
  }));
  const completedCount = doneSet.size;
  const consistencyPct = Math.round((completedCount / 7) * 100);

  // 2. Latest scan this week for zone analysis
  const { data: scans, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', req.userId)
    .gte('created_at', `${weekStart}T00:00:00.000Z`)
    .order('created_at', { ascending: false })
    .limit(1);
  if (scanError) throw new Error(scanError.message);

  // Previous week scan for comparison
  const prevWeekStart = addDays(weekStart, -7);
  const prevWeekEnd = addDays(weekStart, -1);
  const { data: prevScans } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', req.userId)
    .gte('created_at', `${prevWeekStart}T00:00:00.000Z`)
    .lte('created_at', `${prevWeekEnd}T23:59:59.999Z`)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestScan = scans?.[0] || null;
  const prevScan = prevScans?.[0] || null;

  // Build zone analysis from scan data
  let zones = [];
  let ancillary = [];
  if (latestScan) {
    const currentZones = latestScan.zones_json || [];
    const prevZones = prevScan ? (prevScan.zones_json || []) : [];

    zones = currentZones.map((z) => {
      const prev = prevZones.find((p) => p.key === z.key);
      const prevScore = prev ? prev.score : z.score;
      const trend = z.score > prevScore ? 'up' : z.score < prevScore ? 'down' : 'flat';
      return {
        key: z.key,
        label: z.title,
        icon: z.icon,
        score: z.score,
        prev: prevScore,
        trend,
        quote: z.quote || '',
      };
    });
    ancillary = latestScan.ancillary_json || [];
  }

  // 3. Points this week
  const { data: pointsRows } = await supabase
    .from('points_ledger')
    .select('points, created_at')
    .eq('user_id', req.userId)
    .gte('created_at', `${weekStart}T00:00:00.000Z`);
  const weekPoints = (pointsRows || []).reduce((s, r) => s + r.points, 0);

  // 4. Total sessions (routine finishes ever)
  const { data: allFinishes } = await supabase
    .from('routine_finishes')
    .select('id')
    .eq('user_id', req.userId);
  const totalSessions = (allFinishes || []).length;

  // 5. Focus recommendation based on lowest zone score
  let focus = {
    title: 'Keep Up Your Routine',
    desc: 'Consistency is the foundation of skin health. Complete both AM and PM routines daily for the best results.',
  };
  if (zones.length > 0) {
    const lowest = zones.reduce((a, b) => a.score < b.score ? a : b);
    if (lowest.score < 75) {
      focus = {
        title: `Prioritize ${lowest.label} Recovery`,
        desc: lowest.quote || `Focus your care routine on improving your ${lowest.label.toLowerCase()} health this week.`,
      };
    }
  }

  return res.json({
    weekStart,
    weekEnd,
    consistency,
    consistencyPct,
    zones,
    ancillary,
    weekPoints,
    totalSessions,
    focus,
    hasScanData: !!latestScan,
  });
}

module.exports = { getWeeklyReport };
