// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";  
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// Fetch Announcements
// =======================
async function fetchAnnouncements() {
  // Force fresh data (disable caching)
  const { data, error } = await supabase
    .from("announcements")
    .select("*", { head: false })
    .order("scheduled_datetime", { ascending: false });

  if (error) {
    console.error("❌ Error fetching announcements:", error.message);
    return [];
  }
  return data || [];
}
// =======================
// Render Announcements
// =======================
function renderAnnouncements(announcements) {
  const grid = document.querySelector(".announcement-grid");
  if (!grid) return;

  if (!announcements.length) {
    // Default fallback cards when no data in Supabase
    grid.innerHTML = `
      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Welcome to REIGI</h2>
          <p class="date">--/--/--</p>
          <p class="description">Stay tuned for updates and announcements from the registrar’s office.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>

      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Enrollment Information</h2>
          <p class="date">--/--/--</p>
          <p class="description">Important enrollment schedules and guidelines will appear here soon.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>

      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Registrar Updates</h2>
          <p class="date">--/--/--</p>
          <p class="description">Official registrar notices will be displayed in this section once available.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>

      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Exam Schedules</h2>
          <p class="date">--/--/--</p>
          <p class="description">Exam dates and related announcements will appear here soon.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>

      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Events</h2>
          <p class="date">--/--/--</p>
          <p class="description">Upcoming school events and activities will be announced in this section.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>

      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>General Notices</h2>
          <p class="date">--/--/--</p>
          <p class="description">General notices and reminders for students will be posted here.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>
    `;
    return;
  }

  grid.innerHTML = ""; // Clear previous

  announcements.forEach((item) => {
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
        <a href="announcement_article.html?id=${item.id}" class="read-more">read more</a>
      </div>
    `;
    grid.appendChild(card);
  });

  // Refresh Phosphor icons if needed
  window.PhosphorIcons?.replace?.();
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

  // Load initial data
  const announcements = await fetchAnnouncements();
  renderAnnouncements(announcements);

  // 🔄 Refresh every 10s
  setInterval(async () => {
    const announcements = await fetchAnnouncements();
    renderAnnouncements(announcements);
  }, 10000);
}

// ✅ Run when DOM is ready
document.addEventListener("DOMContentLoaded", initAnnouncementsIndex);
