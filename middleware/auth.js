// middleware/auth.js
const { createClient } = require("@supabase/supabase-js");

// Create a Supabase server client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to protect admin pages
async function requireAdminLogin(req, res, next) {
  try {
    const token = req.cookies["access_token"]; // Supabase token

    if (!token) {
      console.log("🔒 No access token found, redirecting to login");
      return res.redirect("/admin/login");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("⚠️ Invalid user or token, redirecting to login");
      return res.redirect("/admin/login");
    }

    // Optional: Check if user is admin (based on metadata)
    if (user.user_metadata?.role !== "admin") {
      console.log("🚫 Not an admin, redirecting to login");
      return res.redirect("/admin/login");
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    res.redirect("/admin/login");
  }
}

module.exports = { requireAdminLogin };
