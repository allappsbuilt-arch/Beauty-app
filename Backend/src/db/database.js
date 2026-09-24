const { Pool } = require('pg');
const { databaseUrl } = require('../config');

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Add your Supabase connection string to Backend/.env (see .env.example).'
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function query(text, params) {
  return pool.query(text, params);
}

const MIGRATIONS_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS routine_step_completions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    step_key TEXT NOT NULL,
    date TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    UNIQUE(user_id, period, step_key, date)
  );

  CREATE TABLE IF NOT EXISTS routine_finishes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    feeling TEXT,
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    zones_json JSONB NOT NULL,
    ancillary_json JSONB NOT NULL
  );

  CREATE TABLE IF NOT EXISTS points_ledger (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notification_prefs (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mute_all BOOLEAN NOT NULL DEFAULT FALSE,
    categories_json JSONB NOT NULL
  );
`;

async function migrate() {
  await pool.query(MIGRATIONS_SQL);
}

module.exports = { pool, query, migrate };
