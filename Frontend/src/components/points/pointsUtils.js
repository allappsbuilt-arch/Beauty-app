import { translate as tr, formatDate, formatTimeOfDay, formatNumber } from '../../i18n';

// "Today, 9:41 AM" / "Yesterday, 8:05 PM" / "Sep 12, 2026, 7:30 AM"
export function formatPointsDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = formatTimeOfDay(date);
  if (date.toDateString() === now.toDateString()) return tr('points.today', { time });
  if (date.toDateString() === yesterday.toDateString()) return tr('points.yesterday', { time });
  return tr('points.dateTime', { date: formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' }), time });
}

export const formatPoints = (n) => {
  const v = Number(n) || 0;
  return tr('points.amount', { sign: v >= 0 ? '+' : '−', amount: formatNumber(Math.abs(v)) });
};

// Friendly message for a failed request (offline vs server error). Network
// failures come back from the API client with status 0.
export function loadErrorMessage(err) {
  if (err?.status === 0) return tr('errors.offlineFriendly');
  return err?.message || tr('common.somethingWrong');
}
