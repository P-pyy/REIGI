// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";  
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// Get ID from URL
// =======================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// =======================
// Fetch Single Announcement
// =======================
async function fetchAnnouncementById(id) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*", { head: false })
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Error fetching announcement:", error.message);
    return null;
  }
  return data;
}

// =======================
// Fetch All Announcements
// =======================
async function fetchAllAnnouncements() {
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
// Render Main Article
// =======================
function renderArticle(announcement) {
  const cardImg = document.querySelector(".card img");
  const cardTitle = document.querySelector(".card-title");
  const cardSubtitle = document.querySelector(".card-subtitle");
  const cardText = document.querySelector(".card-text");

  if (!announcement) {
    // 🔹 Default fallback if no announcement found
    cardImg.src = "img/CARD-BG.png";
    cardTitle.textContent = "Welcome to REIGI";
    cardSubtitle.textContent = "--/--/--";
    cardText.textContent =
      "Stay tuned for updates and announcements from the registrar’s office.";
    return;
  }

  const dateObj = new Date(announcement.scheduled_datetime);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  cardImg.src = announcement.image_url || "img/CARD-BG.png";
  cardTitle.textContent = announcement.title;
  cardSubtitle.textContent = formattedDate;
  cardText.textContent = announcement.details || "";
}

// =======================
// Render "Other Announcements"
// =======================
function renderOtherAnnouncements(all, currentId) {
  const wrapper = document.querySelector(".other-announcements-scroll");
  if (!wrapper) return;

  if (!all.length) {
    // 🔹 Default fallback if no other announcements exist
    wrapper.innerHTML = `
      <article class="announcement-card">
        <img src="img/CARD-BG.png" alt="Default Announcement" />
        <div class="announcement-text">
          <h2>Welcome to REIGI</h2>
          <p class="date">--/--/--</p>
          <p class="description">Stay tuned for updates and announcements from the registrar’s office.</p>
          <a href="#" class="read-more">read more</a>
        </div>
      </article>
    `;
    return;
  }

  wrapper.innerHTML = ""; // Clear old content

  all.forEach((item) => {
    if (item.id == currentId) return; // Skip current

    const dateObj = new Date(item.scheduled_datetime);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    const card = document.createElement("div");
    card.className = "card mb-4 shadow-sm rounded-4 border-0 card-2";
    card.innerHTML = `
      <div class="row g-0">
        <div class="col-md-5">
          <div class="skeleton skeleton-img"></div>
          <img src="${item.image_url || "img/CARD-BG.png"}" class="img-fluid h-100 rounded-start d-none" alt="Announcement">
        </div>
        <div class="col-md-7">
          <div class="card-body">
            <h6 class="card-title2 fw-bold announcement-title">${item.title}</h6>
            <p class="card-text small announcement-date">${formattedDate}</p>
            <a href="announcement_article.html?id=${item.id}" class="text-decoration-none fw-semibold small read-more-2">
              read more <i class="ph-bold ph-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
    wrapper.appendChild(card);
  });
}

// =======================
// Skeleton Loader for Article + Sidebar
// =======================
function renderSkeletons() {
  // Main Article Skeleton
  document.querySelector(".card img").src = "img/CARD-BG.png";
  document.querySelector(".card-title").textContent = "Loading...";
  document.querySelector(".card-subtitle").textContent = "--/--/--";
  document.querySelector(".card-text").textContent =
    "Please wait while we load the announcement...";

  // Other Announcements Skeleton
  const wrapper = document.querySelector(".other-announcements-scroll");
  if (wrapper) {
    wrapper.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement("div");
      skeleton.className =
        "card mb-4 shadow-sm rounded-4 border-0 card-2 skeleton";
      skeleton.innerHTML = `
        <div class="row g-0">
          <div class="col-md-5"><div class="skeleton-img"></div></div>
          <div class="col-md-7">
            <div class="card-body">
              <div class="skeleton-title"></div>
              <div class="skeleton-date"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      `;
      wrapper.appendChild(skeleton);
    }
  }
}

// =======================
// Init
// =======================
async function initArticlePage() {
  if (!id) return;

  renderSkeletons(); // Show fake loading first

  const announcement = await fetchAnnouncementById(id);
  renderArticle(announcement);

  const allAnnouncements = await fetchAllAnnouncements();
  renderOtherAnnouncements(allAnnouncements, id);

  // 🔄 Refresh every 10s
  setInterval(async () => {
    const announcement = await fetchAnnouncementById(id);
    renderArticle(announcement);

    const allAnnouncements = await fetchAllAnnouncements();
    renderOtherAnnouncements(allAnnouncements, id);
  }, 10000);

  window.PhosphorIcons?.replace?.();
}

// ✅ Run
document.addEventListener("DOMContentLoaded", initArticlePage);
