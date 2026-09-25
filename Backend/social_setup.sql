-- ============================================
-- MyFace AI — Socials tables
-- Run once in Supabase → SQL Editor (after supabase_setup.sql).
-- Safe to re-run: every statement is IF NOT EXISTS.
-- ============================================

-- Uploaded photos for posts and stories (JPEG, base64). Served publicly by
-- random id at GET /api/social/media/:id.
CREATE TABLE IF NOT EXISTS social_media (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mime       TEXT NOT NULL,
  data       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS social_posts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption    TEXT NOT NULL DEFAULT '',
  tag        TEXT,
  media_id   TEXT REFERENCES social_media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS social_posts_created_idx ON social_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS social_posts_user_idx ON social_posts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS social_likes (
  post_id    TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_bookmarks (
  post_id    TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS social_comments_post_idx ON social_comments (post_id, created_at);

-- A report hides the post from the reporter's feeds.
CREATE TABLE IF NOT EXISTS social_reports (
  post_id    TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);

-- Stories are shown for 24 hours.
CREATE TABLE IF NOT EXISTS social_stories (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL DEFAULT '',
  bg         TEXT NOT NULL DEFAULT '#C0405A',
  media_id   TEXT REFERENCES social_media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS social_stories_created_idx ON social_stories (created_at DESC);

-- Daily guided mindfulness session ("Live" card): who is in it right now.
CREATE TABLE IF NOT EXISTS mindfulness_sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         TEXT NOT NULL,            -- 'YYYY-MM-DD' (user's local day)
  started_at   TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS mindfulness_sessions_started_idx ON mindfulness_sessions (started_at DESC);

-- The Node backend handles auth with its own JWT (same as the other tables).
ALTER TABLE social_media         DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts         DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_bookmarks     DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments      DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_reports       DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_follows       DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_stories       DISABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_sessions DISABLE ROW LEVEL SECURITY;
