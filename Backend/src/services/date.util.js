const { AsyncLocalStorage } = require('async_hooks');

// Per-request "today" as seen by the client. Dates are stored as calendar
// days, so using the server's UTC day would file a user's morning routine
// under yesterday for anyone ahead of UTC (e.g. India before 05:30).
const requestContext = new AsyncLocalStorage();

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function utcTodayStr() {
  return toDateStr(new Date());
}

function todayStr() {
  return requestContext.getStore()?.clientToday || utcTodayStr();
}

function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateStr(d);
}

function isDateStr(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && toDateStr(new Date(`${value}T00:00:00.000Z`)) === value;
}

// Express middleware: trust the client's local date (X-Client-Date) only when
// it is within a day of UTC — every real timezone is — so it can't be used to
// back-fill or pre-fill other days.
function clientDateMiddleware(req, res, next) {
  const header = req.get('X-Client-Date');
  const utc = utcTodayStr();
  const valid = isDateStr(header)
    && (header === utc || header === addDays(utc, 1) || header === addDays(utc, -1));
  requestContext.run({ clientToday: valid ? header : utc }, next);
}

// Monday=0 .. Sunday=6, matching the frontend's WeekStrip.
function mondayFirstIndex(dateStr) {
  const jsDay = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay(); // Sun=0..Sat=6
  return (jsDay + 6) % 7;
}

function startOfWeek(dateStr) {
  return addDays(dateStr, -mondayFirstIndex(dateStr));
}

module.exports = {
  toDateStr, todayStr, addDays, isDateStr, mondayFirstIndex, startOfWeek, clientDateMiddleware,
};
