// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// =======================
// Check Admin Login
// =======================
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) window.location.href = "login.html";
})();

// =======================
// Load Sidebar
// =======================
fetch('sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('sidebar-container').innerHTML = data;

    // Highlight current page
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach(link => {
      if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });

    //Header JS
    document.getElementById("page-title").textContent = "Announcements";
    
    // Toggle sidebar
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainHeader = document.querySelector('.main-header');

    if (toggleBtn && sidebar && mainContent && mainHeader) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('small-sidebar');
        const isSmall = sidebar.classList.contains('small-sidebar');
        mainContent.style.marginLeft = isSmall ? '80px' : '278px';
        mainHeader.style.width = isSmall ? 'calc(100% - 80px)' : 'calc(100% - 278px)';
        mainHeader.style.marginLeft = isSmall ? '80px' : '278px';
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Logout handler
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        console.log("Logout clicked");
        const { error } = await supabaseClient.auth.signOut(); // ✅ use correct client
        if (error) console.error("Logout error:", error.message);
        else window.location.href = "login.html";
      });
    } else {
      console.warn("⚠️ Logout button not found in sidebar!");
    }
  })
  .catch(error => console.error('Error loading sidebar:', error));

// =======================
// DOMContentLoaded
// =======================
window.addEventListener("DOMContentLoaded", async function () {
  const tbody = document.querySelector(".announcement-table tbody");
  const overlay = document.getElementById("loading-overlay");

  function showLoading() { overlay.classList.add("show"); }
  function hideLoading() { overlay.classList.remove("show"); }

  // Fetch announcements
  async function fetchAnnouncements() {
    showLoading();
    const { data, error } = await supabaseClient
      .from("announcements")
      .select("*")
      .order("scheduled_datetime", { ascending: false });
    hideLoading();
    if (error) {
      console.error("Error fetching announcements:", error.message);
      return [];
    }
    return data;
  }

  // Render table
  function renderTable(announcements) {
    tbody.innerHTML = "";

    announcements.forEach(item => {
  const dateObj = new Date(item.scheduled_datetime); // UTC from Supabase

  // Let JS convert to local PH time automatically
  const formattedDate = dateObj.toLocaleDateString("en-PH", { year: "2-digit", month: "2-digit", day: "2-digit" });
  const formattedTime = dateObj.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });

  const row = document.createElement("tr");
  row.classList.add("fade-in");
  row.innerHTML = `
    <td>${item.id}</td>
    <td>${item.title}</td>
    <td>${item.details}</td>
    <td><img src="${item.image_url}" alt="announcement image" style="width:60px; height:auto; border-radius:4px;"></td>
    <td>${formattedDate}</td>
    <td>${formattedTime}</td>
    <td>
      <a href="#" class="text-primary me-2 edit-link" data-id="${item.id}">Edit</a>
      <a href="#" class="text-danger trash-icon" data-id="${item.id}">
        <i class="ph ph-trash"></i>
      </a>
    </td>
  `;
  tbody.appendChild(row);
});

    // Delete
    document.querySelectorAll(".trash-icon").forEach(btn => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const id = this.dataset.id;
        if (confirm("Are you sure you want to delete this announcement?")) {
          const { error } = await supabaseClient.from("announcements").delete().eq("id", id);
          if (error) alert("Failed to delete: " + error.message);
          else {
            const announcements = await fetchAnnouncements();
            renderTable(announcements);
          }
        }
      });
    });

    // Edit
    document.querySelectorAll(".edit-link").forEach(link => {
      link.addEventListener("click", async e => {
        e.preventDefault();
        const id = link.dataset.id;

        const tableCard = document.querySelector(".admin-announcement-card");
        const addBtn = document.getElementById("add-announcement-btn");
        const formContainer = document.getElementById("edit-form-container");

        tableCard.style.display = "none";
        addBtn.style.display = "none";

        const res = await fetch("announcement_edit.html");
        formContainer.innerHTML = await res.text();
        formContainer.style.display = "block";

        setTimeout(() => {
          import("./announcement_edit.js")
            .then(module => module.initAnnouncementEdit(id))
            .catch(err => console.error("Failed to load announcement_edit.js:", err));
        }, 50);
      });
    });

    if (window.PhosphorIcons) window.PhosphorIcons.replace();
  }

  // Initial fetch & render
  const announcements = await fetchAnnouncements();
  renderTable(announcements);

  // Auto refresh
  setInterval(async () => {
    const announcements = await fetchAnnouncements();
    renderTable(announcements);
  }, 10000);
});

// =======================
// Add New Announcement
// =======================
document.getElementById("add-announcement-btn").addEventListener("click", async () => {
  const tableCard = document.querySelector(".admin-announcement-card");
  const addBtn = document.getElementById("add-announcement-btn");
  const formContainer = document.getElementById("edit-form-container");

  tableCard.style.display = "none";
  addBtn.style.display = "none";

  const res = await fetch("announcement_edit.html");
  formContainer.innerHTML = await res.text();
  formContainer.style.display = "block";

  setTimeout(() => {
    import("./announcement_edit.js")
      .then(module => module.initAnnouncementEdit()) // new announcement
      .catch(err => console.error(err));
  }, 50);
});
