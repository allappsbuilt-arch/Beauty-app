const crypto = require('crypto');
const { supabase } = require('../db/database');
const { HttpError } = require('../utils/httpError');
const { toDataUrl } = require('../services/vision.service');
const { todayStr } = require('../services/date.util');
const points = require('../services/points.service');

const FEED_LIMIT = 20;
const MAX_CAPTION = 500;
const MAX_COMMENT = 300;
const MAX_STORY_TEXT = 200;
const MAX_MEDIA_BYTES = 2 * 1024 * 1024;
const STORY_HOURS = 24;
const TAGS = ['Morning Flow', 'Night Routine', 'Skincare', 'Progress', 'Makeup', 'Mindfulness', 'Wellness', 'Question'];
const STORY_COLORS = ['#C0405A', '#7C6FCD', '#28A090', '#E0920A', '#3A8ED4', '#1E1014'];
const REPORT_REASONS = ['spam', 'inappropriate', 'harassment', 'other'];

// Mindfulness "live" session: someone who started within this window and
// hasn't finished is counted as doing it right now.
const SESSION_MINUTES = 5;
const LIVE_WINDOW_MS = 15 * 60 * 1000;
const MINDFULNESS_POINTS = 5;

// ─── helpers ────────────────────────────────────────────────────────────────

// Run a Supabase query; a missing table means social_setup.sql hasn't been run.
async function q(query) {
  const { data, error } = await query;
  if (error) {
    const missing = error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message || '');
    if (missing) throw new HttpError(503, 'Socials are being set up — the database update (social_setup.sql) has not been applied yet.');
    throw new Error(error.message);
  }
  return data;
}

const newId = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

function publicUser(u) {
  return u ? { id: u.id, name: u.name } : { id: null, name: 'Deleted user' };
}

async function usersById(ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const rows = await q(supabase.from('users').select('id, name').in('id', unique));
  return Object.fromEntries(rows.map((u) => [u.id, u]));
}

async function followingIds(userId) {
  const rows = await q(supabase.from('social_follows').select('followee_id').eq('follower_id', userId));
  return rows.map((r) => r.followee_id);
}

function mediaUrl(req, mediaId) {
  if (!mediaId) return null;
  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || req.protocol;
  return `${proto}://${host}/api/social/media/${mediaId}`;
}

// Validates and stores a photo; returns its id (or null when none sent).
async function saveMedia(userId, image) {
  if (!image) return null;
  const dataUrl = toDataUrl(image);
  const [, mime, b64] = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if ((b64.length * 3) / 4 > MAX_MEDIA_BYTES) throw new HttpError(413, 'Photo is too large — please use a smaller image');
  const id = newId();
  await q(supabase.from('social_media').insert({ id, user_id: userId, mime, data: b64, created_at: nowIso() }));
  return id;
}

// Adds author, counts and the viewer's like/bookmark/follow state.
async function hydratePosts(req, rows) {
  if (!rows.length) return [];
  const ids = rows.map((p) => p.id);
  const [likes, comments, bookmarks, users, following] = await Promise.all([
    q(supabase.from('social_likes').select('post_id, user_id').in('post_id', ids)),
    q(supabase.from('social_comments').select('post_id').in('post_id', ids)),
    q(supabase.from('social_bookmarks').select('post_id').eq('user_id', req.userId).in('post_id', ids)),
    usersById(rows.map((p) => p.user_id)),
    followingIds(req.userId),
  ]);
  const count = (list, id) => list.filter((x) => x.post_id === id).length;
  const saved = new Set(bookmarks.map((b) => b.post_id));
  return rows.map((p) => ({
    id: p.id,
    author: publicUser(users[p.user_id]),
    caption: p.caption,
    tag: p.tag,
    imageUrl: mediaUrl(req, p.media_id),
    createdAt: p.created_at,
    likeCount: count(likes, p.id),
    commentCount: count(comments, p.id),
    liked: likes.some((l) => l.post_id === p.id && l.user_id === req.userId),
    bookmarked: saved.has(p.id),
    isMine: p.user_id === req.userId,
    authorFollowed: following.includes(p.user_id),
  }));
}

async function reportedIds(userId) {
  const rows = await q(supabase.from('social_reports').select('post_id').eq('user_id', userId));
  return new Set(rows.map((r) => r.post_id));
}

async function findPost(id) {
  const rows = await q(supabase.from('social_posts').select('*').eq('id', id).limit(1));
  if (!rows.length) throw new HttpError(404, 'This post no longer exists');
  return rows[0];
}

// ─── feed & posts ───────────────────────────────────────────────────────────

async function feed(req, res) {
  const tab = req.query.tab === 'discover' ? 'discover' : 'following';
  const before = req.query.before;
  let query = supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(FEED_LIMIT + 1);
  if (tab === 'following') query = query.in('user_id', [req.userId, ...(await followingIds(req.userId))]);
  if (before) query = query.lt('created_at', before);
  const [rows, hidden] = await Promise.all([q(query), reportedIds(req.userId)]);
  const page = rows.slice(0, FEED_LIMIT);
  const posts = await hydratePosts(req, page.filter((p) => !hidden.has(p.id)));
  return res.json({ tab, posts, nextCursor: rows.length > FEED_LIMIT ? page[page.length - 1].created_at : null });
}

async function createPost(req, res) {
  const caption = typeof req.body?.caption === 'string' ? req.body.caption.trim() : '';
  const tag = req.body?.tag || null;
  const { image } = req.body || {};
  if (!caption && !image) return res.status(400).json({ error: 'Write something or add a photo' });
  if (caption.length > MAX_CAPTION) return res.status(400).json({ error: `Posts can be up to ${MAX_CAPTION} characters` });
  if (tag && !TAGS.includes(tag)) return res.status(400).json({ error: 'Unknown tag' });

  const mediaId = await saveMedia(req.userId, image);
  const row = { id: newId(), user_id: req.userId, caption, tag, media_id: mediaId, created_at: nowIso() };
  await q(supabase.from('social_posts').insert(row));
  const [post] = await hydratePosts(req, [row]);
  return res.status(201).json({ post });
}

async function deletePost(req, res) {
  const post = await findPost(req.params.id);
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'You can only delete your own posts' });
  await q(supabase.from('social_posts').delete().eq('id', post.id).eq('user_id', req.userId));
  if (post.media_id) await q(supabase.from('social_media').delete().eq('id', post.media_id));
  return res.json({ deleted: true });
}

async function setLike(req, res) {
  const post = await findPost(req.params.id);
  const liked = req.body?.liked !== false;
  if (liked) {
    await q(supabase.from('social_likes').upsert(
      { post_id: post.id, user_id: req.userId, created_at: nowIso() },
      { onConflict: 'post_id,user_id', ignoreDuplicates: true }
    ));
  } else {
    await q(supabase.from('social_likes').delete().eq('post_id', post.id).eq('user_id', req.userId));
  }
  const likes = await q(supabase.from('social_likes').select('user_id').eq('post_id', post.id));
  return res.json({ liked, likeCount: likes.length });
}

async function setBookmark(req, res) {
  const post = await findPost(req.params.id);
  const bookmarked = req.body?.bookmarked !== false;
  if (bookmarked) {
    await q(supabase.from('social_bookmarks').upsert(
      { post_id: post.id, user_id: req.userId, created_at: nowIso() },
      { onConflict: 'post_id,user_id', ignoreDuplicates: true }
    ));
  } else {
    await q(supabase.from('social_bookmarks').delete().eq('post_id', post.id).eq('user_id', req.userId));
  }
  return res.json({ bookmarked });
}

async function bookmarks(req, res) {
  const saved = await q(supabase.from('social_bookmarks').select('post_id, created_at').eq('user_id', req.userId).order('created_at', { ascending: false }));
  if (!saved.length) return res.json({ posts: [] });
  const rows = await q(supabase.from('social_posts').select('*').in('id', saved.map((s) => s.post_id)));
  const order = saved.map((s) => s.post_id);
  rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return res.json({ posts: await hydratePosts(req, rows) });
}

async function reportPost(req, res) {
  const post = await findPost(req.params.id);
  const reason = REPORT_REASONS.includes(req.body?.reason) ? req.body.reason : 'other';
  if (post.user_id === req.userId) return res.status(400).json({ error: 'You cannot report your own post' });
  await q(supabase.from('social_reports').upsert(
    { post_id: post.id, user_id: req.userId, reason, created_at: nowIso() },
    { onConflict: 'post_id,user_id' }
  ));
  return res.json({ reported: true });
}

// ─── comments ───────────────────────────────────────────────────────────────

async function listComments(req, res) {
  await findPost(req.params.id);
  const rows = await q(supabase.from('social_comments').select('*').eq('post_id', req.params.id).order('created_at', { ascending: true }));
  const users = await usersById(rows.map((c) => c.user_id));
  return res.json({
    comments: rows.map((c) => ({ id: c.id, author: publicUser(users[c.user_id]), text: c.text, createdAt: c.created_at, isMine: c.user_id === req.userId })),
  });
}

async function addComment(req, res) {
  const post = await findPost(req.params.id);
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ error: 'Write a comment first' });
  if (text.length > MAX_COMMENT) return res.status(400).json({ error: `Comments can be up to ${MAX_COMMENT} characters` });
  const row = { id: newId(), post_id: post.id, user_id: req.userId, text, created_at: nowIso() };
  await q(supabase.from('social_comments').insert(row));
  const [users, all] = await Promise.all([
    usersById([req.userId]),
    q(supabase.from('social_comments').select('id').eq('post_id', post.id)),
  ]);
  return res.status(201).json({
    comment: { id: row.id, author: publicUser(users[req.userId]), text, createdAt: row.created_at, isMine: true },
    commentCount: all.length,
  });
}

async function deleteComment(req, res) {
  const rows = await q(supabase.from('social_comments').select('*').eq('id', req.params.id).limit(1));
  if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
  if (rows[0].user_id !== req.userId) return res.status(403).json({ error: 'You can only delete your own comments' });
  await q(supabase.from('social_comments').delete().eq('id', rows[0].id));
  const all = await q(supabase.from('social_comments').select('id').eq('post_id', rows[0].post_id));
  return res.json({ deleted: true, commentCount: all.length });
}

// ─── stories ────────────────────────────────────────────────────────────────

async function listStories(req, res) {
  const since = new Date(Date.now() - STORY_HOURS * 3600000).toISOString();
  const authors = [req.userId, ...(await followingIds(req.userId))];
  const rows = await q(supabase.from('social_stories').select('*').in('user_id', authors).gte('created_at', since).order('created_at', { ascending: true }));
  const users = await usersById(rows.map((s) => s.user_id));
  const groups = new Map();
  for (const s of rows) {
    if (!groups.has(s.user_id)) groups.set(s.user_id, { user: publicUser(users[s.user_id]), isMine: s.user_id === req.userId, items: [] });
    groups.get(s.user_id).items.push({ id: s.id, text: s.text, bg: s.bg, imageUrl: mediaUrl(req, s.media_id), createdAt: s.created_at });
  }
  // Mine first, then most recent first.
  const list = [...groups.values()].sort((a, b) => (b.isMine - a.isMine)
    || (b.items[b.items.length - 1].createdAt.localeCompare(a.items[a.items.length - 1].createdAt)));
  return res.json({ stories: list });
}

async function createStory(req, res) {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const bg = STORY_COLORS.includes(req.body?.bg) ? req.body.bg : STORY_COLORS[0];
  const { image } = req.body || {};
  if (!text && !image) return res.status(400).json({ error: 'Add some text or a photo' });
  if (text.length > MAX_STORY_TEXT) return res.status(400).json({ error: `Stories can be up to ${MAX_STORY_TEXT} characters` });
  const mediaId = await saveMedia(req.userId, image);
  const row = { id: newId(), user_id: req.userId, text, bg, media_id: mediaId, created_at: nowIso() };
  await q(supabase.from('social_stories').insert(row));
  return res.status(201).json({ story: { id: row.id, text, bg, imageUrl: mediaUrl(req, mediaId), createdAt: row.created_at } });
}

async function deleteStory(req, res) {
  const rows = await q(supabase.from('social_stories').select('*').eq('id', req.params.id).limit(1));
  if (!rows.length) return res.status(404).json({ error: 'Story not found' });
  if (rows[0].user_id !== req.userId) return res.status(403).json({ error: 'You can only delete your own stories' });
  await q(supabase.from('social_stories').delete().eq('id', rows[0].id));
  if (rows[0].media_id) await q(supabase.from('social_media').delete().eq('id', rows[0].media_id));
  return res.json({ deleted: true });
}

// ─── people ─────────────────────────────────────────────────────────────────

async function profile(req, res) {
  const users = await usersById([req.params.id]);
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  const [posts, followers, following] = await Promise.all([
    q(supabase.from('social_posts').select('id').eq('user_id', user.id)),
    q(supabase.from('social_follows').select('follower_id').eq('followee_id', user.id)),
    q(supabase.from('social_follows').select('followee_id').eq('follower_id', user.id)),
  ]);
  return res.json({
    user: publicUser(user),
    isMe: user.id === req.userId,
    isFollowing: followers.some((f) => f.follower_id === req.userId),
    postCount: posts.length,
    followerCount: followers.length,
    followingCount: following.length,
  });
}

async function userPosts(req, res) {
  const [rows, hidden] = await Promise.all([
    q(supabase.from('social_posts').select('*').eq('user_id', req.params.id).order('created_at', { ascending: false }).limit(50)),
    reportedIds(req.userId),
  ]);
  return res.json({ posts: await hydratePosts(req, rows.filter((p) => !hidden.has(p.id))) });
}

async function setFollow(req, res) {
  const target = req.params.id;
  if (target === req.userId) return res.status(400).json({ error: 'You cannot follow yourself' });
  const users = await usersById([target]);
  if (!users[target]) return res.status(404).json({ error: 'User not found' });
  const follow = req.body?.follow !== false;
  if (follow) {
    await q(supabase.from('social_follows').upsert(
      { follower_id: req.userId, followee_id: target, created_at: nowIso() },
      { onConflict: 'follower_id,followee_id', ignoreDuplicates: true }
    ));
  } else {
    await q(supabase.from('social_follows').delete().eq('follower_id', req.userId).eq('followee_id', target));
  }
  const followers = await q(supabase.from('social_follows').select('follower_id').eq('followee_id', target));
  return res.json({ isFollowing: follow, followerCount: followers.length });
}

// People to follow: most recent posters the user doesn't follow yet.
async function suggestions(req, res) {
  const following = new Set([req.userId, ...(await followingIds(req.userId))]);
  const recent = await q(supabase.from('social_posts').select('user_id, created_at').order('created_at', { ascending: false }).limit(200));
  const ids = [...new Set(recent.map((p) => p.user_id))].filter((id) => !following.has(id)).slice(0, 10);
  const users = await usersById(ids);
  return res.json({ users: ids.filter((id) => users[id]).map((id) => publicUser(users[id])) });
}

// ─── media (public, by unguessable id) ──────────────────────────────────────

async function media(req, res) {
  const rows = await q(supabase.from('social_media').select('mime, data').eq('id', req.params.id).limit(1));
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.set('Content-Type', rows[0].mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  return res.send(Buffer.from(rows[0].data, 'base64'));
}

// ─── daily mindfulness session ("Live" card) ────────────────────────────────

async function liveStatus(req, res) {
  const today = todayStr();
  const since = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();
  const [active, todays] = await Promise.all([
    q(supabase.from('mindfulness_sessions').select('user_id, completed_at').gte('started_at', since)),
    q(supabase.from('mindfulness_sessions').select('user_id, completed_at').eq('date', today)),
  ]);
  const activeUsers = new Set(active.filter((s) => !s.completed_at).map((s) => s.user_id));
  return res.json({
    title: 'Daily Mindfulness Routine',
    minutes: SESSION_MINUTES,
    liveCount: activeUsers.size,
    todayCount: new Set(todays.map((s) => s.user_id)).size,
    completedToday: todays.some((s) => s.user_id === req.userId && s.completed_at),
  });
}

async function joinLive(req, res) {
  const row = { id: newId(), user_id: req.userId, date: todayStr(), started_at: nowIso(), completed_at: null };
  await q(supabase.from('mindfulness_sessions').insert(row));
  return res.status(201).json({ sessionId: row.id, minutes: SESSION_MINUTES });
}

async function completeLive(req, res) {
  const rows = await q(supabase.from('mindfulness_sessions').select('*').eq('id', req.params.id).eq('user_id', req.userId).limit(1));
  if (!rows.length) return res.status(404).json({ error: 'Session not found' });
  const session = rows[0];
  if (session.completed_at) return res.json({ completed: true, pointsAwarded: 0 });
  // Points once per day.
  const earlier = await q(supabase.from('mindfulness_sessions').select('id, completed_at').eq('user_id', req.userId).eq('date', session.date));
  const firstToday = !earlier.some((s) => s.completed_at);
  await q(supabase.from('mindfulness_sessions').update({ completed_at: nowIso() }).eq('id', session.id));
  if (firstToday) await points.award(req.userId, 'Mindfulness Session', MINDFULNESS_POINTS);
  return res.json({ completed: true, pointsAwarded: firstToday ? MINDFULNESS_POINTS : 0 });
}

// Leaving early: stop counting the user as "live".
async function leaveLive(req, res) {
  await q(supabase.from('mindfulness_sessions').delete().eq('id', req.params.id).eq('user_id', req.userId).is('completed_at', null));
  return res.json({ left: true });
}

module.exports = {
  TAGS, STORY_COLORS,
  feed, createPost, deletePost, setLike, setBookmark, bookmarks, reportPost,
  listComments, addComment, deleteComment,
  listStories, createStory, deleteStory,
  profile, userPosts, setFollow, suggestions, media,
  liveStatus, joinLive, completeLive, leaveLive,
};
