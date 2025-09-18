//     // <!-- Load Sidebar -->

//       fetch("sidebar.html")
//         .then((res) => res.text())
//         .then((data) => {
//           document.getElementById("sidebar-container").innerHTML = data;
//           const currentPage = window.location.pathname.split("/").pop();
//           document.querySelectorAll(".menu li a").forEach((link) => {
//             if (link.getAttribute("href") === currentPage)
//               link.classList.add("active");
//           });
//         })
//         .catch(console.error);


//     // <!-- Swap Forms JS -->

//       const swapLinks = document.querySelectorAll(".swap-link");
//       const forms = document.querySelectorAll(".form-section");
//       const backBtns = document.querySelectorAll(".back-btn");
//       const closeBtns = document.querySelectorAll(".close-btn");
//       const sectionsToHide = [
//         document.getElementById("security-settings"),
//         document.getElementById("account-history"),
//       ];

//       // Swap to forms
//       swapLinks.forEach((link) => {
//         link.addEventListener("click", (e) => {
//           e.preventDefault();
//           const targetId = link.dataset.target;

//           // Hide security + account history
//           sectionsToHide.forEach((sec) => (sec.style.display = "none"));

//           // Hide all forms, show selected
//           forms.forEach((f) => (f.style.display = "none"));
//           document.getElementById(targetId).style.display = "block";
//         });
//       });

//       // Back buttons
//       backBtns.forEach((btn) => {
//         btn.addEventListener("click", () => {
//           forms.forEach((f) => (f.style.display = "none"));
//           sectionsToHide.forEach((sec) => (sec.style.display = "block"));
//         });
//       });

//       // Close buttons (same as back)
//       closeBtns.forEach((btn) => {
//         btn.addEventListener("click", () => {
//           forms.forEach((f) => (f.style.display = "none"));
//           sectionsToHide.forEach((sec) => (sec.style.display = "block"));
//         });
//       });


//       // settings.js
// import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// // Supabase Config (same as login.js)
// const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
// const SUPABASE_ANON_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // Utility: show Bootstrap alert inside a form
// function showMessage(form, message, type = "danger") {
//   let msgDiv = form.querySelector(".form-message");
//   if (!msgDiv) {
//     msgDiv = document.createElement("div");
//     msgDiv.className = "form-message mt-3";
//     form.appendChild(msgDiv);
//   }
//   msgDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
// }

// // =======================
// // CHANGE PASSWORD FORM
// // =======================
// const changePasswordForm = document.getElementById("changePasswordForm");

// if (changePasswordForm) {
//   changePasswordForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const currentPassword = changePasswordForm.currentPassword.value.trim();
//     const newPassword = changePasswordForm.newPassword.value.trim();
//     const reenterNewPassword =
//       changePasswordForm.reenterNewPassword.value.trim();

//     // Validate new password match
//     if (newPassword !== reenterNewPassword) {
//       showMessage(changePasswordForm, "❌ New passwords do not match", "danger");
//       return;
//     }

//     // Re-authenticate user
//     const { data: sessionData, error: sessionError } =
//       await supabase.auth.getSession();

//     if (sessionError || !sessionData.session) {
//       showMessage(
//         changePasswordForm,
//         "❌ Please log in again to change your password.",
//         "danger"
//       );
//       return;
//     }

//     const userEmail = sessionData.session.user.email;

//     // Check current password
//     const { error: signInError } = await supabase.auth.signInWithPassword({
//       email: userEmail,
//       password: currentPassword,
//     });

//     if (signInError) {
//       showMessage(changePasswordForm, "❌ Current password is incorrect", "danger");
//       return;
//     }

//     // Update password
//     const { error: updateError } = await supabase.auth.updateUser({
//       password: newPassword,
//     });

//     if (updateError) {
//       showMessage(changePasswordForm, "❌ " + updateError.message, "danger");
//     } else {
//       showMessage(
//         changePasswordForm,
//         "✅ Password updated successfully!",
//         "success"
//       );
//       changePasswordForm.reset();
//     }
//   });
// }

// // // =======================
// // CHANGE EMAIL FORM
// // =======================
// const changeEmailForm = document.getElementById("changeEmailForm");

// if (changeEmailForm) {
//   changeEmailForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const currentEmail = changeEmailForm.currentEmail.value.trim();
//     const newEmail = changeEmailForm.newEmail.value.trim();

//     // Get current session
//     const { data: sessionData, error: sessionError } =
//       await supabase.auth.getSession();

//     if (sessionError || !sessionData.session) {
//       showMessage(
//         changeEmailForm,
//         "❌ Please log in again to change your email.",
//         "danger"
//       );
//       return;
//     }

//     const loggedInEmail = sessionData.session.user.email;

//     if (currentEmail !== loggedInEmail) {
//       showMessage(
//         changeEmailForm,
//         "❌ The current email does not match your logged-in email.",
//         "danger"
//       );
//       return;
//     }

//     // Update email (triggers confirmation email from Supabase)
//     const { data: updatedUser, error: updateError } =
//       await supabase.auth.updateUser({
//         email: newEmail,
//       });

//     console.log("Update result:", updatedUser, updateError);

//     if (updateError) {
//       showMessage(changeEmailForm, "❌ " + updateError.message, "danger");
//     } else {
//       // 🔄 Refresh user to check status
//       const { data: refreshedUser, error: refreshError } =
//         await supabase.auth.getUser();

//       console.log("Refreshed user after update:", refreshedUser, refreshError);

//       let message = "";
//       if (refreshedUser?.user?.new_email) {
//         // Supabase is waiting for confirmation on the new email
//         message = `⚠️ Email change is pending confirmation.<br>
//           Current active email: <b>${refreshedUser.user.email}</b><br>
//           New email (unconfirmed): <b>${refreshedUser.user.new_email}</b><br>
//           📩 Please check your inbox and confirm the new email.`;
//       } else {
//         // If new_email is empty, the change is confirmed
//         message = `✅ Email updated successfully!<br>
//           Active email is now: <b>${refreshedUser?.user?.email}</b>`;
//       }

//       showMessage(changeEmailForm, message, "success");

//       // Logout and redirect after a short delay
//       setTimeout(async () => {
//         await supabase.auth.signOut();
//         window.location.href = "login.html";
//       }, 3000);
//     }
//   });
// }

// <!-- Load Sidebar -->
fetch("sidebar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("sidebar-container").innerHTML = data;
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach((link) => {
      if (link.getAttribute("href") === currentPage)
        link.classList.add("active");
    });
  })
  .catch(console.error);

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
    document.getElementById(targetId).style.display = "block";
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

// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      await supabase.auth.getSession();

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
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      showMessage(changePasswordForm, "❌ Current password is incorrect", "danger");
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
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
      await supabase.auth.getSession();

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
      await supabase.auth.updateUser(
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
        await supabase.auth.getUser();

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
        await supabase.auth.signOut();
        window.location.href = "login.html";
      }, 3000);
    }
  });
}
