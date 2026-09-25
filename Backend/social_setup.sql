-- ============================================
-- MyFace AI — Socials tables
-- Run once in Supabase → SQL Editor (after supabase_setup.sql).
-- Safe to re-run: every statement is IF NOT EXISTS.
-- ============================================

-- Uploaded photos for posts and stories. The file lives in the
-- "social-media" Storage bucket (storage_path); `data` (base64) is only a
-- fallback used if Storage isn't available.
CREATE TABLE IF NOT EXISTS social_media (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mime         TEXT NOT NULL,
  data         TEXT,
  storage_path TEXT,
  created_at   TIMESTAMPTZ NOT NULL
);
-- Upgrades a social_media table created by an earlier version of this file.
ALTER TABLE social_media ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE social_media ALTER COLUMN data DROP NOT NULL;

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

-- ============================================
-- Photo storage: public-read bucket for post/story photos.
-- Files are stored as <user id>/<random id>.<ext>; the backend uploads and
-- deletes them (it uses the same key as for the tables above).
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('social-media', 'social-media', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 2097152, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "social-media backend read"   ON storage.objects;
DROP POLICY IF EXISTS "social-media backend upload" ON storage.objects;
DROP POLICY IF EXISTS "social-media backend delete" ON storage.objects;
CREATE POLICY "social-media backend read"   ON storage.objects FOR SELECT TO anon USING (bucket_id = 'social-media');
CREATE POLICY "social-media backend upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'social-media');
CREATE POLICY "social-media backend delete" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'social-media');
