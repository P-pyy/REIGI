import { supabaseClient } from "/js/supabase-client.js";

document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // COMBOBOX INIT
  // ==============================
  function makeCombobox({ wrapId, inputId, listId, options }) {
    const wrap = document.getElementById(wrapId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!wrap || !input || !list) return;

    function render(query = '') {
      list.innerHTML = '';

      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cb-option empty';
        empty.textContent = 'No campuses found';
        list.appendChild(empty);
        return;
      }

      filtered.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'cb-option';
        div.textContent = opt.label;

        div.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = opt.label;
          wrap.classList.remove('open');
        });

        list.appendChild(div);
      });
    }

    function open() {
      wrap.classList.add('open');
      render(input.value);
    }

    function close() {
      wrap.classList.remove('open');
    }

    input.addEventListener('focus', open);
    input.addEventListener('input', () => render(input.value));

    wrap.querySelector('.cb-arrow').addEventListener('mousedown', (e) => {
      e.preventDefault();
      wrap.classList.contains('open') ? close() : open();
      input.focus();
    });

    document.addEventListener('mousedown', (e) => {
      if (!wrap.contains(e.target)) close();
    });
  }

  // INIT COMBOBOX
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

  // ==============================
  // PASSWORD TOGGLE FIX
  // ==============================
  document.querySelectorAll('.show-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  const loginForm = document.getElementById("super-admin-loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = loginForm.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Signing in...";

    const campus = document.getElementById("cb1-input").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      // AUTH LOGIN
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

      // CHECK CAMPUS + ROLE IN  TABLE
      const { data: account, error: accError } = await supabaseClient
        .from("campus_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("campus", campus)
        .eq("role", "super_admin")
        .single();

      if (accError || !account) {
        await supabaseClient.auth.signOut();

        alert("❌ Access denied. Not a valid super admin for this campus.");
        button.disabled = false;
        button.textContent = "Sign In";
        return;
      }

      // LOGIN HISTORY
      await supabaseClient.from("login_history").insert([
        {
          user_id: user.id,
          device: navigator.userAgent,
          location: "Super Admin Login",
        },
      ]);

      //  SESSION TO SERVER
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

      alert("✅ Super Admin Login successful!");

      // REDIRECT TO DASHBOARD
      window.location.href = "/admin/dashboard";

    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong. Try again.");
    } finally {
      button.disabled = false;
      button.textContent = "Sign In";
    }
  });
}

});

