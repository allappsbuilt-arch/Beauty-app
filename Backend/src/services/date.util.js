function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function todayStr() {
  return toDateStr(new Date());
}

function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateStr(d);
}

// Monday=0 .. Sunday=6, matching the frontend's WeekStrip.
function mondayFirstIndex(dateStr) {
  const jsDay = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay(); // Sun=0..Sat=6
  return (jsDay + 6) % 7;
}

function startOfWeek(dateStr) {
  return addDays(dateStr, -mondayFirstIndex(dateStr));
}

module.exports = { toDateStr, todayStr, addDays, mondayFirstIndex, startOfWeek };
