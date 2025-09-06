// login.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔹 Replace with your Supabase project details
const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// LOGIN FORM
// =======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("❌ Login failed: " + error.message);
    } else {
      alert("✅ Login successful!");
      window.location.href = "admin.html"; // redirect to dashboard
    }
  });

  // Show/Hide password toggle
  document.getElementById("showPassword").addEventListener("change", function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type = this.checked ? "text" : "password";
  });
}

// =======================
// FORGOT PASSWORD (EMAIL ENTRY FORM)
// =======================
const resetForm = document.getElementById("resetForm");
const msg = document.getElementById("message"); // message element for feedback

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    if (!email) {
      msg.textContent = "❌ Please enter your email";
      msg.style.color = "red";
      return;
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://reigi.vercel.app/admin/login_reset/index.html",
    });

    //  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: "https://reigi.vercel.app/admin/login_reset/",
    // });


    if (error) {
      msg.textContent = "❌ " + error.message;
      msg.style.color = "red";
    } else {
      msg.textContent = "✅ Password reset email sent! Check your inbox.";
      msg.style.color = "green";
    }
  });
}


// =======================
// RESET PASSWORD FORM
// =======================
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const reenterPassword = document.getElementById("reenterPassword").value;

    if (newPassword !== reenterPassword) {
      document.getElementById("reenter-password-error").hidden = false;
      return;
    } else {
      document.getElementById("reenter-password-error").hidden = true;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    const status = document.getElementById("resetStatus");
    if (error) {
      status.textContent = "❌ " + error.message;
      status.style.color = "red";
    } else {
      status.textContent = "✅ Password has been reset. Redirecting to login...";
      status.style.color = "green";

      setTimeout(() => {
        window.location.assign("/admin/login.html");
      }, 2500);
    }
  });

  // Show/Hide password toggle
  document.getElementById("showPassword").addEventListener("change", function () {
    const pw1 = document.getElementById("newPassword");
    const pw2 = document.getElementById("reenterPassword");
    const type = this.checked ? "text" : "password";
    pw1.type = type;
    pw2.type = type;
  });
}
