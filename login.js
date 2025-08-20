import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  confirmPasswordReset
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBuQHu8PgSNBYivZSw07tgeKpIVWcBxang",
  authDomain: "reigi-b78a6.firebaseapp.com",
  projectId: "reigi-b78a6",
  storageBucket: "reigi-b78a6.appspot.com",
  messagingSenderId: "601396882172",
  appId: "1:601396882172:web:87b792abab906d2e864579"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//
// 🔹 Login form
//
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login successful!");
        window.location.href = "admin.html";
      })
      .catch(error => {
        alert("Login failed: " + error.message);
      });
  });
}

// ✅ Show/Hide password toggle (works for login & reset pages)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("showPassword");
  if (toggle) {
    toggle.addEventListener("change", function () {
      const passwordFields = document.querySelectorAll(
        "#password, #newPassword, #reenterPassword"
      );
      passwordFields.forEach((field) => {
        if (field) field.type = this.checked ? "text" : "password";
      });
    });
  }
});


//
// 🔹 Forgot password page (send reset email)
//
const forgotForm = document.getElementById('resetForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const messageEl = document.getElementById('message');

    sendPasswordResetEmail(auth, email)
      .then(() => {
        messageEl.textContent = "✅ Password reset email sent! Check your inbox.";
        messageEl.className = "success";
      })
      .catch(error => {
        messageEl.textContent = "❌ Error: " + error.message;
        messageEl.className = "error";
      });
  });
}

//
// 🔹 Reset password page (set new password)
//
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const reenterPassword = document.getElementById("reenterPassword").value;
    const statusEl = document.getElementById("resetStatus");

    if (newPassword !== reenterPassword) {
      statusEl.textContent = "❌ Passwords do not match!";
      statusEl.className = "error";
      return;
    }

    // Get reset code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");

    if (!oobCode) {
      statusEl.textContent = "❌ Invalid or missing reset code. Please try again.";
      statusEl.className = "error";
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      statusEl.textContent = "✅ Password has been successfully reset. Redirecting to login...";
      statusEl.className = "success";

      // Redirect after 4s delay so user can read the message
      setTimeout(() => {
        window.location.href = "login_admin.html";
      }, 4000); // 4 seconds

    } catch (error) {
      console.error("Password reset error:", error);
      statusEl.textContent = "❌ Failed to reset password: " + error.message;
      statusEl.className = "error";
    }
  });
}
