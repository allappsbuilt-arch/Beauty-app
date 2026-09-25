-- ============================================
-- BeautyApp — Run this once in Supabase SQL Editor
-- Supabase → SQL Editor → New Query → Paste → Run
-- ============================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL
);

-- 2. ROUTINE STEP COMPLETIONS
CREATE TABLE IF NOT EXISTS routine_step_completions (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period       TEXT NOT NULL,         -- 'AM' or 'PM'
  step_key     TEXT NOT NULL,
  date         TEXT NOT NULL,         -- 'YYYY-MM-DD'
  completed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, period, step_key, date)
);

-- 3. ROUTINE FINISHES
CREATE TABLE IF NOT EXISTS routine_finishes (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,           -- 'YYYY-MM-DD'
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, date)
);

-- 4. CHECKINS
CREATE TABLE IF NOT EXISTS checkins (
  id      SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date    TEXT NOT NULL,              -- 'YYYY-MM-DD'
  feeling TEXT,
  UNIQUE(user_id, date)
);

-- 5. SCANS
CREATE TABLE IF NOT EXISTS scans (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL,
  zones_json     JSONB NOT NULL,
  ancillary_json JSONB NOT NULL
);

-- 6. POINTS LEDGER
CREATE TABLE IF NOT EXISTS points_ledger (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  points     INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

-- 7. NOTIFICATION PREFS
CREATE TABLE IF NOT EXISTS notification_prefs (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mute_all        BOOLEAN NOT NULL DEFAULT FALSE,
  categories_json JSONB NOT NULL
);

-- 8. TRACKER CHECKS (water intake, rewards dedup, referrals)
CREATE TABLE IF NOT EXISTS tracker_checks (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area       TEXT NOT NULL,           -- 'water' | 'rewards' | 'referred_by'
  item_key   TEXT NOT NULL,
  date       TEXT NOT NULL,           -- 'YYYY-MM-DD' or 'once' for lifetime
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, area, item_key, date)
);

-- 9. COACH MESSAGES
CREATE TABLE IF NOT EXISTS coach_messages (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "from"     TEXT NOT NULL,           -- 'user' or 'coach'
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

-- 9. MAKEUP SESSIONS (occasion picker → generated looks)
CREATE TABLE IF NOT EXISTS makeup_sessions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occasion        TEXT NOT NULL,
  notes           TEXT NOT NULL DEFAULT '',
  looks_json      JSONB NOT NULL,
  recommended_key TEXT,
  created_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS makeup_sessions_user_idx ON makeup_sessions (user_id, created_at DESC);

-- 10. USER PREFERENCES (coach style, teen controls, style picks, allergies…)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  prefs_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- 11. DAILY CHECKS (tracker checklists + product shelf usage)
CREATE TABLE IF NOT EXISTS tracker_checks (
  id       SERIAL PRIMARY KEY,
  user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area     TEXT NOT NULL,             -- 'eyebrow' | 'eyelash' | 'undereye' | 'lips' | 'scalp' | 'shelf'
  item_key TEXT NOT NULL,
  date     TEXT NOT NULL,             -- 'YYYY-MM-DD'
  UNIQUE(user_id, area, item_key, date)
);

-- 12. PRODUCT SHELF
CREATE TABLE IF NOT EXISTS shelf_items (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, product_key)
);

-- 13. PRODUCT REVIEWS (one per user per product)
CREATE TABLE IF NOT EXISTS product_reviews (
  id          SERIAL PRIMARY KEY,
  product_key TEXT NOT NULL,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT NOT NULL,
  skin_type   TEXT,
  created_at  TIMESTAMPTZ NOT NULL,
  UNIQUE(product_key, user_id)
);

-- 14. REVIEW HELPFUL VOTES
CREATE TABLE IF NOT EXISTS review_votes (
  review_id INTEGER NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (review_id, user_id)
);

-- ============================================
-- Disable Row Level Security (RLS)
-- Your Node backend handles auth with its own JWT.
-- ============================================
ALTER TABLE users                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE routine_step_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE routine_finishes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE scans                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger            DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs       DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_checks          DISABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages           DISABLE ROW LEVEL SECURITY;
ALTER TABLE makeup_sessions          DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences         DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_checks           DISABLE ROW LEVEL SECURITY;
ALTER TABLE shelf_items              DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews          DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes             DISABLE ROW LEVEL SECURITY;
