import { supabaseClient } from '/js/supabase-client.js';

// ==========================================
// COMBOBOX
// ==========================================
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
        choose(opt);
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

  function choose(item) {
    input.value = item.label;
    close();
  }

  input.addEventListener('focus', open);
  input.addEventListener('input', () => render(input.value));

  wrap.querySelector('.cb-arrow').addEventListener('mousedown', (e) => {
    e.preventDefault();

    if (wrap.classList.contains('open')) {
      close();
    } else {
      open();
    }

    input.focus();
  });

  document.addEventListener('mousedown', (e) => {
    if (!wrap.contains(e.target)) close();
  });
}

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

// ==========================================
// PASSWORD SHOW/HIDE
// ==========================================
document.querySelectorAll('.show-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;

    input.type = input.type === 'password'
      ? 'text'
      : 'password';
  });
});

// ==========================================
// FORM ELEMENTS
// ==========================================
const form = document.getElementById("super-admin-createForm");
const alertContainer = document.querySelector(".alert-message-submit-container");
const closeBtn = document.getElementById("close-btn-alert");
const backdrop = document.getElementById("overlay-backdrop");
const proceedBtn = document.querySelector(".proceed-btn-alert");
const status = document.getElementById("resetStatus");

// ==========================================
// FORM SUBMIT
// ==========================================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const reenterPassword = document.getElementById("reenter-password").value;

  const passwordError = document.getElementById("reenter-password-error");

  if (password !== reenterPassword) {
    passwordError.hidden = false;
    return;
  }

  passwordError.hidden = true;

  alertContainer.hidden = false;
  backdrop.classList.add("is-visible");
});

// ==========================================
// CLOSE MODAL
// ==========================================
closeBtn.addEventListener("click", (e) => {
  e.preventDefault();

  alertContainer.hidden = true;
  backdrop.classList.remove("is-visible");
});

backdrop.addEventListener("click", () => {
  alertContainer.hidden = true;
  backdrop.classList.remove("is-visible");
});

// ==========================================
// CREATE WINDOW ADMIN ACCOUNT
// ==========================================
proceedBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  proceedBtn.disabled = true;
  proceedBtn.textContent = "Creating Account...";

  const campus = document.getElementById("cb1-input").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {

  // CHECK WINDOW ADMIN LIMIT (MAX 2)
  const { count, error: countError } = await supabaseClient
    .from("campus_accounts")
    .select("*", { count: "exact", head: true })
    .eq("campus", campus)
    .eq("role", "window_admin");

  if (countError) {
    status.textContent = "❌ Error checking existing accounts.";
    status.style.color = "red";

    proceedBtn.disabled = false;
    proceedBtn.textContent = "Proceed";
    return;
  }

  if ((count || 0) >= 2) {
    status.textContent = "❌ This campus already has 2 window admin accounts.";
    status.style.color = "red";

    proceedBtn.disabled = false;
    proceedBtn.textContent = "Proceed";
    return;
  }

    // ==========================================
    // CREATE AUTH USER
    // ==========================================
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      status.textContent = "❌ " + error.message;
      status.style.color = "red";

      proceedBtn.disabled = false;
      proceedBtn.textContent = "Proceed";

      return;
    }

    // ==========================================
    // INSERT ACCOUNT INFO
    // ==========================================
    const { error: insertError } = await supabaseClient
      .from("campus_accounts")
      .insert([
        {
          user_id: data.user.id,
          campus: campus,
          email: email,
          role: "window_admin"
        }
      ]);

    if (insertError) {
      status.textContent = "❌ " + insertError.message;
      status.style.color = "red";

      proceedBtn.disabled = false;
      proceedBtn.textContent = "Proceed";

      return;
    }

    // ==========================================
    // SUCCESS
    // ==========================================
    alertContainer.hidden = true;
    backdrop.classList.remove("is-visible");

    status.textContent = "✅ Window admin account successfully created!";
    status.style.color = "green";

    form.reset();

    proceedBtn.disabled = false;
    proceedBtn.textContent = "Proceed";

    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 1500);

  } catch (err) {
    console.error(err);

    status.textContent = "❌ Something went wrong.";
    status.style.color = "red";

    proceedBtn.disabled = false;
    proceedBtn.textContent = "Proceed";
  }
});