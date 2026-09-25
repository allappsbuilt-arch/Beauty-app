require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'insecure-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  // Any vision-capable model that supports Structured Outputs.
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // Image-editing model for Virtual Try-On and the Aging Simulator.
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
};
