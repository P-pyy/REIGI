// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// DOMContentLoaded
// =======================
window.addEventListener("DOMContentLoaded", async function () {
  const tbody = document.querySelector(".announcement-table tbody");
  const overlay = document.getElementById("loading-overlay");

  function showLoading() { overlay.classList.add("show"); }
  function hideLoading() { overlay.classList.remove("show"); }

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

  function renderTable(announcements) {
    tbody.innerHTML = "";

    announcements.forEach(item => {
      const dateObj = new Date(item.scheduled_datetime);
      const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
      const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      const row = document.createElement("tr");
      row.classList.add("fade-in");
      row.innerHTML = `
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

    // Delete announcement
    document.querySelectorAll(".trash-icon").forEach(btn => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const id = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this announcement?")) {
          const { error } = await supabaseClient.from("announcements").delete().eq("id", id);
          if (error) alert("Failed to delete announcement: " + error.message);
          else {
            const announcements = await fetchAnnouncements();
            renderTable(announcements);
          }
        }
      });
    });

    // Edit announcement
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

        // Pass the selected id to the edit form
        setTimeout(() => {
          import("./announcement_edit.js")
            .then(module => module.initAnnouncementEdit(id))
            .catch(err => console.error("Failed to load announcement_edit.js:", err));
        }, 50);
      });
    });

    if (window.PhosphorIcons) window.PhosphorIcons.replace();
  }

  const announcements = await fetchAnnouncements();
  renderTable(announcements);

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
      .then(module => module.initAnnouncementEdit()) // no id means new announcement
      .catch(err => console.error("Failed to load announcement_edit.js:", err));
  }, 50);
});
