// login.js
import { supabaseClient } from '/js/supabase-client.js';

async function getUserLocation() {
  // Check if geolocation is available
  if ("geolocation" in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use a reverse geocoding API to get city, country
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || "Unknown City";
            const country = data.address.country || "Unknown Country";
            resolve(`${city}, ${country}`);
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
            resolve("Unknown");
          }
        },
        (err) => {
          console.warn("Geolocation permission denied or error:", err);
          resolve("Unknown");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  } else {
    console.warn("Geolocation is not available in this browser");
    return "Unknown";
  }
}


// =======================
// LOGIN FORM
// =======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("❌ Login failed: " + error.message);
    } else {
      const user = data.user; // logged-in user

      if (user) {
        const parser = new UAParser();
        const result = parser.getResult();
        const friendlyDevice = `${result.os.name || "Unknown OS"} ${result.os.version || ""} - ${result.browser.name || "Unknown Browser"} ${result.browser.version || ""}`;

        const userLocation = await getUserLocation(); // get City, Country

        await supabaseClient.from("login_history").insert([
          {
            user_id: user.id,
            device: friendlyDevice,
            location: userLocation,
          },
        ]);
      }

      alert("✅ Login successful!");
      // window.location.href = "/admin/dashboard"; // redirect to dashboard
      // ✅ Send access token to backend for cookie storage
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (accessToken) {
        await fetch("/api/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken }), // 🔧 corrected
      credentials: "include",
    });
      }

      // Redirect after cookie is set
      window.location.href = "/admin/dashboard";

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

    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: "https://reigi.vercel.app/admin/login_reset_password",
    });

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

    const { data, error } = await supabaseClient.auth.updateUser({
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
        window.location.assign("/admin/login");
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
