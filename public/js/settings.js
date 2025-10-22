// <!-- Swap Forms JS -->
const swapLinks = document.querySelectorAll(".swap-link");
const forms = document.querySelectorAll(".form-section");
const backBtns = document.querySelectorAll(".back-btn");
const closeBtns = document.querySelectorAll(".close-btn");
const sectionsToHide = [
  document.getElementById("security-settings"),
  document.getElementById("account-history"),
];

// Swap to forms
swapLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.dataset.target;

    // Hide security + account history
    sectionsToHide.forEach((sec) => (sec.style.display = "none"));

    // Hide all forms, show selected
    forms.forEach((f) => (f.style.display = "none"));
    document.getElementById(targetId).style.display = "flex";
  });
});

// Back buttons
backBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    forms.forEach((f) => (f.style.display = "none"));
    sectionsToHide.forEach((sec) => (sec.style.display = "block"));
  });
});

// Close buttons (same as back)
closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    forms.forEach((f) => (f.style.display = "none"));
    sectionsToHide.forEach((sec) => (sec.style.display = "block"));
  });
});



import { supabaseClient } from '/js/supabase-client.js';



// =======================
// Check Admin Login
// =======================
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";  // Redirect if not logged in
  } else {
    // Set the authenticated session to use admin access rights
    supabaseClient.auth.setSession(session.access_token);
  }
})();

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



// Utility: show Bootstrap alert inside a form
function showMessage(form, message, type = "danger") {
  let msgDiv = form.querySelector(".form-message");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.className = "form-message mt-3";
    form.appendChild(msgDiv);
  }
  msgDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

// =======================
// CHANGE PASSWORD FORM
// =======================
const changePasswordForm = document.getElementById("changePasswordForm");

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = changePasswordForm.currentPassword.value.trim();
    const newPassword = changePasswordForm.newPassword.value.trim();
    const reenterNewPassword =
      changePasswordForm.reenterNewPassword.value.trim();

    // Validate new password match
    if (newPassword !== reenterNewPassword) {
      showMessage(changePasswordForm, "❌ New passwords do not match", "danger");
      return;
    }

    // Re-authenticate user
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
      showMessage(
        changePasswordForm,
        "❌ Please log in again to change your password.",
        "danger"
      );
      return;
    }

    const userEmail = sessionData.session.user.email;

    // Check current password
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      showMessage(changePasswordForm, "❌ Current password is incorrect", "danger");
      return;
    }

    // Update password
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      showMessage(changePasswordForm, "❌ " + updateError.message, "danger");
    } else {
      showMessage(
        changePasswordForm,
        "✅ Password updated successfully!",
        "success"
      );
      changePasswordForm.reset();
    }
  });
}

// =======================
// CHANGE EMAIL FORM
// =======================
const changeEmailForm = document.getElementById("changeEmailForm");

if (changeEmailForm) {
  changeEmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentEmail = changeEmailForm.currentEmail.value.trim();
    const newEmail = changeEmailForm.newEmail.value.trim();

    // Get current session
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
      showMessage(
        changeEmailForm,
        "❌ Please log in again to change your email.",
        "danger"
      );
      return;
    }

    const loggedInEmail = sessionData.session.user.email;

    if (currentEmail !== loggedInEmail) {
      showMessage(
        changeEmailForm,
        "❌ The current email does not match your logged-in email.",
        "danger"
      );
      return;
    }

    // ✅ Update email with redirectTo (important for confirmation links)
    const { data: updatedUser, error: updateError } =
      await supabaseClient.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: "https://reigi.vercel.app/admin/login.html"
        }
      );

    console.log("Update result:", updatedUser, updateError);

    if (updateError) {
      showMessage(changeEmailForm, "❌ " + updateError.message, "danger");
    } else {
      // 🔄 Refresh user to check status
      const { data: refreshedUser, error: refreshError } =
        await supabaseClient.auth.getUser();

      console.log("Refreshed user after update:", refreshedUser, refreshError);

      let message = "";
      if (refreshedUser?.user?.new_email) {
        message = `⚠️ Email change is pending confirmation.<br>
          Current active email: <b>${refreshedUser.user.email}</b><br>
          New email (unconfirmed): <b>${refreshedUser.user.new_email}</b><br>
          📩 Please check your inbox and confirm the new email.`;
      } else {
        message = `✅ Email updated successfully!<br>
          Active email is now: <b>${refreshedUser?.user?.email}</b>`;
      }

      showMessage(changeEmailForm, message, "success");

      // Logout and redirect after a short delay
      setTimeout(async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
      }, 3000);
    }
  });
}

// ======================= 
// LOGIN ALERTS + HISTORY
// =======================

const alertEmail = document.getElementById("alertEmail");
const currentDevice = document.getElementById("currentDevice");
const loginHistoryList = document.getElementById("loginHistoryList");

async function loadUserAlertsAndHistory() {
  const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError || !sessionData.session) {
    console.error("No active session:", sessionError);
    return;
  }

  const user = sessionData.session.user;

  if (alertEmail) alertEmail.textContent = user.email;

  // Insert current login into history
  try {
    const parser = new UAParser();
    const result = parser.getResult();
    const friendlyDevice = `${result.os.name || "Unknown OS"} ${result.os.version || ""} - ${result.browser.name || "Unknown Browser"} ${result.browser.version || ""}`;

    const userLocation = await getUserLocation(); // City, Country

  } catch (err) {
    console.error("Error inserting login history:", err);
  }

  // Fetch login history
  const { data: history, error } = await supabaseClient
    .from("login_history")
    .select("*")
    .order("login_time", { ascending: false });

  if (error) {
    console.error("Error fetching login history:", error);
    return;
  }

  // Show latest session
  if (history.length > 0) {
    const latest = history[0];
    const date = new Date(latest.login_time).toLocaleString();

    currentDevice.innerHTML = `
      <h5>${latest.device || "Unknown Device"}</h5>
      <p class="mb-0">${latest.location || "Unknown Location"}</p>
      <p class="text-success fw-bold">This Device</p>
      <small class="text-muted">${date}</small>
    `;
  } else {
    currentDevice.innerHTML = "<p class='text-muted'>No current session found.</p>";
  }

  // Show saved devices
  loginHistoryList.innerHTML = "";
  if (history.length === 0) {
    loginHistoryList.innerHTML = "<p class='text-muted'>No login history available.</p>";
    return;
  }

  history.forEach((item, index) => {
    if (index === 0) return; // skip latest

    const deviceItem = document.createElement("div");
    deviceItem.className = "device-item";
    const date = new Date(item.login_time).toLocaleString();

    deviceItem.innerHTML = `
      <div>
        <h6>${item.device || "Unknown Device"}</h6>
        <small>${item.location || "Unknown Location"}</small><br />
        <small class="text-muted">${date}</small>
      </div>
      <i class="bi bi-chevron-right"></i>
    `;

    loginHistoryList.appendChild(deviceItem);
  });
}

// Load alerts & history when page is ready
loadUserAlertsAndHistory();
