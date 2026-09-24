require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'insecure-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};
