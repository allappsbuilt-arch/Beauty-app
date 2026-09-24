const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey } = require('../config');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_ANON_KEY must be set in Backend/.env\n' +
    'Find them at: Supabase → Settings → API'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify connection and run table migrations via Supabase RPC or direct calls.
// Supabase manages the underlying Postgres — tables are created via the dashboard
// or by running the SQL below once in the Supabase SQL editor.
async function migrate() {
  // Check connection is alive by doing a lightweight query
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = table doesn't exist yet, that's ok on first run
    // any other error means connection failed
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  console.log('Supabase connected successfully.');
}

module.exports = { supabase, migrate };
