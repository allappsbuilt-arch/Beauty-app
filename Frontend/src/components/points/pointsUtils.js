// "Today, 9:41 AM" / "Yesterday, 8:05 PM" / "Sep 12, 2026, 7:30 AM"
export function formatPointsDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${time}`;
}

export const formatPoints = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toLocaleString()} pts`;

// Friendly message for a failed request (offline vs server error).
export function loadErrorMessage(err) {
  const msg = err?.message || '';
  if (/reach the server|taking too long/i.test(msg)) return 'You’re offline or the server is waking up. Check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}
