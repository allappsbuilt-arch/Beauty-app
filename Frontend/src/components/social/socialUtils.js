import { colors } from '../../theme/colors';
import { translate as tr, formatDate } from '../../i18n';

// Avatar colours (same palette the Socials screen was designed with). Each
// user always gets the same pair, derived from their id.
const AVATAR_PALETTE = [
  { color: '#D96080', bg: '#FFF0F3' },
  { color: '#C77DFF', bg: '#F5EEFF' },
  { color: '#48B8E0', bg: '#EDF8FE' },
  { color: '#F07840', bg: '#FFF4EC' },
  { color: '#3A8ED4', bg: '#EAF4FD' },
  { color: '#28A090', bg: '#E6F8F5' },
];

export function avatarColors(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function initialsOf(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}

export function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || tr('post.user');
}

export function timeAgo(iso) {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return tr('time.justNow');
  const mins = Math.round(secs / 60);
  if (mins < 60) return tr('time.minutesAgo', { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return tr('time.hoursAgo', { count: hours });
  const days = Math.round(hours / 24);
  if (days < 7) return tr('time.daysAgo', { count: days });
  return formatDate(iso, { month: 'short', day: 'numeric' });
}

export function formatCount(n) {
  if (n >= 1000) return tr('time.thousandShort', { n: (n / 1000).toFixed(1).replace('.0', '') });
  return String(n);
}

// Tags a post can carry (must match the backend list) and their pill colours.
// The stored values stay English; `tagLabel` gives the display name.
export const POST_TAGS = ['Morning Flow', 'Night Routine', 'Skincare', 'Progress', 'Makeup', 'Mindfulness', 'Wellness', 'Question']; // i18n-ignore: stored values
const TAG_KEYS = {
  'Morning Flow': 'socialTags.morningFlow',
  'Night Routine': 'socialTags.nightRoutine',
  Skincare: 'socialTags.skincare',
  Progress: 'socialTags.progress',
  Makeup: 'socialTags.makeup',
  Mindfulness: 'socialTags.mindfulness',
  Wellness: 'socialTags.wellness',
  Question: 'socialTags.question',
};
export const tagLabel = (tag) => (TAG_KEYS[tag] ? tr(TAG_KEYS[tag]) : tag);
const TAG_COLORS = {
  'Morning Flow': { color: '#28A090', bg: '#E6F8F5' },
  'Night Routine': { color: '#7C6FCD', bg: '#F0EEFF' },
  Skincare: { color: colors.primary, bg: colors.primaryPale },
  Progress: { color: '#E07840', bg: '#FFF3EC' },
  Makeup: { color: '#E05080', bg: '#FFF0F5' },
  Mindfulness: { color: '#3A8ED4', bg: '#EAF4FD' },
  Wellness: { color: '#28A090', bg: '#E6F8F5' },
  Question: { color: '#E0920A', bg: '#FFF8EC' },
};
export const tagColors = (tag) => TAG_COLORS[tag] ?? { color: colors.textMid, bg: colors.sectionBg };

// Background colours a text story can use (must match the backend list).
export const STORY_COLORS = ['#C0405A', '#7C6FCD', '#28A090', '#E0920A', '#3A8ED4', '#1E1014'];
