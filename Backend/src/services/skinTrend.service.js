// Builds the Skin card's "3-SCAN TREND" from real scan history.
// The trend is derived at read time (not frozen into the stored scan), so it
// always reflects the latest 3 scans up to and including the scan shown.

const WINDOW = 3;

const skinScoreOf = (zones) => {
  const s = (zones || []).find((z) => z.key === 'skin')?.score;
  return typeof s === 'number' ? s : null;
};

// Signed one-decimal percent; rounds first so -0.04 shows as "+0.0%".
function formatDelta(latest, previous) {
  const rounded = Math.round(((latest - previous) / previous) * 1000) / 10;
  return `${rounded < 0 ? '-' : '+'}${Math.abs(rounded).toFixed(1)}%`;
}

// `scores` = skin scores oldest → latest, ending with the scan being shown.
function buildSkinTrend(scores) {
  const recent = scores.filter((n) => typeof n === 'number').slice(-WINDOW);
  if (recent.length === 0) return null;

  const latest = recent[recent.length - 1];
  const previous = recent.length > 1 ? recent[recent.length - 2] : null;
  // No previous scan (or a 0 score) means there is nothing honest to compare.
  const value = previous ? formatDelta(latest, previous) : null;

  let message = null;
  if (recent.length === 1) message = 'Not enough scans for trend';
  else if (recent.length < WINDOW) message = `${WINDOW - recent.length} more scan for a full ${WINDOW}-scan trend`;

  return {
    label: `${WINDOW}-SCAN TREND`,
    value,
    message,
    scores: recent,
    bars: recent.map((s) => s / 100),
  };
}

// Returns zones with the skin zone's trend replaced by one built from
// `olderScores` (newest first, excluding this scan) plus this scan's score.
function withSkinTrend(zones, olderScoresNewestFirst) {
  const current = skinScoreOf(zones);
  if (current === null) return zones;
  const history = olderScoresNewestFirst.slice(0, WINDOW - 1).reverse();
  const trend = buildSkinTrend([...history, current]);
  return zones.map((z) => (z.key === 'skin' ? { ...z, trend } : z));
}

module.exports = { WINDOW, skinScoreOf, buildSkinTrend, withSkinTrend };
