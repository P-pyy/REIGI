export const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY
};

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}