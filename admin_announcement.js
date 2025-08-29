// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";  
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener("DOMContentLoaded", async function () {
  const tbody = document.querySelector(".announcement-table tbody");
  const overlay = document.getElementById("loading-overlay");

  function showLoading() {
    overlay.classList.add("show");
  }
  function hideLoading() {
    overlay.classList.remove("show");
  }

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

    announcements.forEach((item) => {
      const dateObj = new Date(item.scheduled_datetime);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });
      const formattedTime = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const row = document.createElement("tr");
      row.classList.add("fade-in");
      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.details}</td>
        <td><img src="${item.image_url}" alt="announcement image" style="width:60px; height:auto; border-radius:4px;"></td>
        <td>${formattedDate}</td>
        <td>${formattedTime}</td>
        <td>
          <a href="admin_announcement_edit.html?id=${item.id}" class="text-primary me-2 edit-link">Edit</a>
          <a href="#" class="text-danger trash-icon" data-id="${item.id}">
            <i class="ph ph-trash"></i>
          </a>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Delete event
    document.querySelectorAll(".trash-icon").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const id = this.getAttribute("data-id");

        if (confirm("Are you sure you want to delete this announcement?")) {
          const { error } = await supabaseClient
            .from("announcements")
            .delete()
            .eq("id", id);

          if (error) {
            console.error("Delete failed:", error.message);
            alert("Failed to delete announcement.");
          } else {
            // refresh table
            const announcements = await fetchAnnouncements();
            renderTable(announcements);
          }
        }
      });
    });

    if (window.PhosphorIcons) window.PhosphorIcons.replace();
  }

  // Initial load
  const announcements = await fetchAnnouncements();
  renderTable(announcements);

  // Auto-refresh every 10 seconds (optional)
  setInterval(async () => {
    const announcements = await fetchAnnouncements();
    renderTable(announcements);
  }, 10000);
});
