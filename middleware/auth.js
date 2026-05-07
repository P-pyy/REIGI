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

    // Get user from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("⚠️ Invalid user or token, redirecting to login");
      return res.redirect("/admin/login");
    }

    // 🔥 GET ROLE FROM YOUR TABLE
    const { data: account, error: accError } = await supabase
      .from("campus_accounts")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (accError || !account) {
      console.log("❌ No account found, redirecting to login");
      return res.redirect("/admin/login");
    }

    // ✅ ROLE CHECK (FIXED)
    if (!["admin", "super_admin"].includes(account.role)) {
      console.log("❌ Not authorized, redirecting to login");
      return res.redirect("/admin/login");
    }

    req.user = user;
    req.role = account.role; // optional but useful

    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    res.redirect("/admin/login");
  }
}

module.exports = { requireAdminLogin };