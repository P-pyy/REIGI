const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function requireAdminLogin(req, res, next) {
  try {
    const token = req.cookies["access_token"]; 

    if (!token) {
      console.log("🔒 No access token found, redirecting to login");
      return res.redirect("/admin/login");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("⚠️ Invalid user or token, redirecting to login");
      return res.redirect("/admin/login");
    }

    if (user.user_metadata?.role !== "admin") {
      console.log(" Not an admin, redirecting to login");
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
