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

-- 8. COACH MESSAGES
CREATE TABLE IF NOT EXISTS coach_messages (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from       TEXT NOT NULL,           -- 'user' or 'coach'
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
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
ALTER TABLE coach_messages           DISABLE ROW LEVEL SECURITY;
