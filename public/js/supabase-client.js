import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Get values from window.__ENV__ (will be populated by server)
const SUPABASE_URL = window.__ENV__?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// // Get values from window.__ENV__ (populated by your .env)
// const SUPABASE_URL = window.__ENV__?.SUPABASE_URL;
// const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY;

// // export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
// //   auth: {
// //     persistSession: true,
// //     autoRefreshToken: true,
// //   },
// // });



