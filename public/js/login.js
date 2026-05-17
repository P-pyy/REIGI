import { supabaseClient } from '/js/supabase-client.js';

async function getUserLocation() {
  if ("geolocation" in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
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

function makeCombobox({ wrapId, inputId, listId, options }) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);

  if (!wrap || !input || !list) return;

  function render(query = '') {
    list.innerHTML = '';
    const lowerQuery = query.toLowerCase();
    
    const filtered = options.filter(opt => opt.label.toLowerCase().includes(lowerQuery));

    if (filtered.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'cb-option empty';
      emptyState.textContent = 'No campuses found';
      list.appendChild(emptyState);
      return;
    }

    filtered.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'cb-option';
      div.textContent = opt.label;
      
      div.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        choose(opt);
      });
      list.appendChild(div);
    });
  }

  function open() {
    wrap.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
    render(input.value);
  }

  function close() {
    wrap.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
  }

  function choose(item) {
    input.value = item.label; 
    close();
  }

  input.addEventListener('focus', () => open());
  input.addEventListener('input', () => render(input.value));
  wrap.querySelector('.cb-arrow').addEventListener('mousedown', e => {
    e.preventDefault();
    wrap.classList.contains('open') ? close() : open();
    input.focus();
  });
  document.addEventListener('mousedown', e => {
    if (!wrap.contains(e.target)) close();
  });

}

// ==========================================
// GLOBAL COMBOBOX INITIALIZATION
// This will now automatically run on ANY page that has the cb1 HTML structure.
// ==========================================
const cbWrapExists = document.getElementById('cb1');
if (cbWrapExists) {
  makeCombobox({
    wrapId: 'cb1',
    inputId: 'cb1-input', 
    listId: 'cb1-list',    
    options: [
      { value: 'angono', label: 'Angono' },
      { value: 'antipolo', label: 'Antipolo City' },
      { value: 'binangonan', label: 'Binangonan' },
      { value: 'cainta', label: 'Cainta' },
      { value: 'cardona', label: 'Cardona' },
      { value: 'morong', label: 'Morong' },
      { value: 'pilillia', label: 'Pilillia' },
      { value: 'rodriguez', label: 'Rodriguez' },
      { value: 'tanay', label: 'Tanay' },
      { value: 'taytay', label: 'Taytay' },
    ]
  });
}

// ==========================================
// SHOW/HIDE PASSWORD TOGGLE LOGIC
// ==========================================
const eyeOpenSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
  </svg>
`;

const eyeClosedSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
    <path d="M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z"></path>
  </svg>
`;

document.querySelectorAll('.show-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    
    if (input && input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = eyeClosedSVG;
      btn.style.color = '#111'; 
    } else if (input && input.type === 'text') {
      input.type = 'password';
      btn.innerHTML = eyeOpenSVG;
      btn.style.color = ''; 
    }
  });
});


const loginForm = document.getElementById("loginForm");
if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = loginForm.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Signing in...";

    try {
      // 1. Fetch ALL three inputs
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const campus = document.getElementById("cb1-input").value; // <-- Added Campus Fetch

      // 2. Authenticate
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("❌ Login failed: " + error.message);
        button.disabled = false; 
        button.textContent = "Sign In";
        return;
      }

      const user = data.user;
      if (user) {
        const parser = new UAParser();
        const result = parser.getResult();
        const friendlyDevice = `${result.os.name || "Unknown OS"} ${result.os.version || ""} - ${result.browser.name || "Unknown Browser"} ${result.browser.version || ""}`;

        const userLocation = await getUserLocation();

        // 3. Save to History (Now includes the Campus)
        await supabaseClient.from("login_history").insert([
          {
            user_id: user.id,
            device: friendlyDevice,
            location: userLocation,
            campus: campus // <-- Logs the selected campus to your database
          },
        ]);
      }

      // alert(" Login successful!"); // Optional: You can remove this for a smoother UX

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (accessToken) {
        await fetch("/api/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken }),
          credentials: "include",
        });
      }

      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(" Something went wrong. Please try again.");
      button.disabled = false;
      button.textContent = "Sign In";
    }
  });

  // Checkbox show password logic
  document.getElementById("showPassword").addEventListener("change", function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type = this.checked ? "text" : "password";
  });
}

const resetForm = document.getElementById("resetForm");
const msg = document.getElementById("message"); 

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
      status.textContent = " " + error.message;
      status.style.color = "red";
    } else {
      status.textContent = " Password has been reset. Redirecting to login...";
      status.style.color = "green";

      setTimeout(() => {
        window.location.assign("/admin/login");
      }, 2500);
    }
  });

  

  document.getElementById("showPassword").addEventListener("change", function () {
    const pw1 = document.getElementById("newPassword");
    const pw2 = document.getElementById("reenterPassword");
    const type = this.checked ? "text" : "password";
    pw1.type = type;
    pw2.type = type;
  });
}

// ==========================================
// SUPER ADMIN CREATE ACCOUNT LOGIC
// ==========================================
const createSuperAdminForm = document.getElementById("super-admin-createForm");

if (createSuperAdminForm) {
  const alertContainer = document.querySelector(".alert-message-submit-container");
  const closeAlertBtn = document.getElementById("close-btn-alert");
  const proceedBtn = alertContainer.querySelector("button[type='submit']");
  
  // 1. Grab the backdrop element
  const backdrop = document.getElementById("overlay-backdrop");

  // 2. Intercept the Form Submission
  createSuperAdminForm.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const pass = document.getElementById("password").value;
    const rePass = document.getElementById("reenter-password").value;
    const errPass = document.getElementById("reenter-password-error");

    if (pass !== rePass) {
      errPass.hidden = false;
      return; 
    } else {
      errPass.hidden = true;
    }

    // Show the popup AND the dark backdrop
    alertContainer.hidden = false;
    backdrop.classList.add('is-visible');
  });

  // 3. Handle the "Close (X)" button
  closeAlertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Hide both popup and backdrop
    alertContainer.hidden = true; 
    backdrop.classList.remove('is-visible');
  });

  // 4. Handle clicking the background to close it (Optional but excellent UX)
  backdrop.addEventListener("click", () => {
    alertContainer.hidden = true; 
    backdrop.classList.remove('is-visible');
  });

  // 5. Handle the final "Proceed" button
  proceedBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    proceedBtn.disabled = true;
    proceedBtn.textContent = "Creating Account...";

    const campus = document.getElementById("cb1-input").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      console.log(`Ready to create: ${campus} | ${email}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = document.getElementById("resetStatus");
      
      // Hide popup and backdrop on success
      alertContainer.hidden = true; 
      backdrop.classList.remove('is-visible');
      
      status.textContent = "✅ Account successfully created!";
      status.style.color = "green";
      
      createSuperAdminForm.reset();
      proceedBtn.disabled = false;
      proceedBtn.textContent = "Proceed";

    } catch (err) {
      console.error("Error creating account:", err);
      proceedBtn.disabled = false;
      proceedBtn.textContent = "Proceed";
      alert("❌ Something went wrong.");
    }
  });
}
