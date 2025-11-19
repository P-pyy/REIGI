import { supabaseClient } from '/js/supabase-client.js';

// =======================
// Global Announcement Store
// =======================
let allAnnouncements = [];

// =======================
// Fetch Announcements
// =======================
async function fetchAnnouncements() {
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*", { head: false })
    .order("scheduled_datetime", { ascending: false });

  if (error) {
    console.error("❌ Error fetching announcements:", error.message);
    return [];
  }

function renderAnnouncements(announcements) {
  const grid = document.querySelector(".announcement-grid");
  if (!grid) return;

  // If there are no announcements at all or after filtering
  if (!announcements || announcements.length === 0) {
    grid.innerHTML = `
      <p class="no-announcements" style="grid-column:1/-1; text-align:center; padding:40px; font-size:1.2rem; color:#555;">
        No announcements found.
      </p>
    `;
    return;
  }

  // Render announcements
  grid.innerHTML = ""; // Clear previous

  announcements.forEach((item, index) => {  
    const dateObj = new Date(item.scheduled_datetime);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    const card = document.createElement("article");
    card.className = "announcement-card";
    card.innerHTML = `
      <img src="${item.image_url || "img/CARD-BG.png"}" alt="Announcement Image" />
      <div class="announcement-text">
        <h2>${item.title}</h2>
        <p class="date">${formattedDate}</p>
        <p class="description">${(item.details || "").substring(0, 150)}...</p>
        <a href="/announcement-article?id=${item.id}" class="read-more">read more</a>
      </div>
    `;
    grid.appendChild(card);
  });
});

  window.PhosphorIcons?.replace?.();
}


// =======================
// Filter Announcements
// =======================
function filterAnnouncements() {
  const searchInput = document.getElementById("search")?.value.toLowerCase() || "";
  const monthSelect = document.getElementById("month")?.value.toLowerCase() || "default";

  return allAnnouncements.filter(item => {
    const title = item.title?.toLowerCase() || "";

    const titleMatch = !searchInput || title.includes(searchInput);

    const dateObj = new Date(item.scheduled_datetime);
    const monthName = dateObj.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const monthMatch = monthSelect === "default" || monthName === monthSelect;

    if (searchInput && monthSelect !== "default") return titleMatch && monthMatch;
    if (searchInput) return titleMatch;
    if (monthSelect !== "default") return monthMatch;
    return true;
  });
}

// =======================
// Setup Filters
// =======================
function setupFilters() {
  const searchInput = document.getElementById("search");
  const monthSelect = document.getElementById("month");

  if (!searchInput || !monthSelect) return;

  const filterAndRender = () => {
    const filtered = filterAnnouncements();
    renderAnnouncements(filtered);
  };

  searchInput.addEventListener("input", filterAndRender);
  monthSelect.addEventListener("change", filterAndRender);
}

// =======================
// Init
// =======================
async function initAnnouncementsIndex() {
  const grid = document.querySelector(".announcement-grid");
  if (grid) {
    grid.innerHTML = `
      <div class="loading-spinner" style="grid-column: 1/-1; display:flex; justify-content:center; align-items:center; padding:40px;">
        <div class="spinner"></div>
      </div>
    `;
  }

  // Load announcements once
  allAnnouncements = await fetchAnnouncements();
  renderAnnouncements(allAnnouncements);

    // =======================
  // Enable Realtime Updates
  // =======================
  supabaseClient
    .channel('realtime:announcements')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      async (payload) => {
        console.log('🔄 Realtime change detected:', payload);

        // Re-fetch announcements when something changes
        allAnnouncements = await fetchAnnouncements();
        const filtered = filterAnnouncements();
        renderAnnouncements(filtered);
      }
    )
    .subscribe();


  // Setup real-time filtering
  setupFilters();


}

// ✅ Run when DOM is ready
document.addEventListener("DOMContentLoaded", initAnnouncementsIndex);
