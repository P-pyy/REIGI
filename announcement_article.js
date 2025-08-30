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
  const container = document.querySelector(".article-placeholder");
  if (!container) return;

  let title, subtitle, text, img;

  if (!announcement) {
    // 🔹 Default fallback if no announcement found
    title = "Welcome to REIGI";
    subtitle = "--/--/--";
    text = "Stay tuned for updates and announcements from the registrar’s office.";
    img = "img/CARD-BG.png";
  } else {
    const dateObj = new Date(announcement.scheduled_datetime);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    title = announcement.title;
    subtitle = formattedDate;
    text = announcement.details || "";
    img = announcement.image_url || "img/CARD-BG.png";
  }

  // Inject card with opacity 0 for fade-in
  container.innerHTML = `
    <div class="card article-card" style="opacity:0; transition: opacity 0.5s ease-in-out;">
      <img src="${img}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">${subtitle}</h6>
        <p class="card-text">${text}</p>
      </div>
    </div>
  `;

  // Trigger fade-in
  requestAnimationFrame(() => {
    const card = container.querySelector(".article-card");
    if (card) card.style.opacity = "1";
  });
}

// =======================
// Skeleton Loader for Article + Sidebar
// =======================
function renderSkeletons() {
  const container = document.querySelector(".article-placeholder");
  if (container) {
    container.innerHTML = `
      <div class="card skeleton">
        <div class="skeleton-img" style="height:200px; background:#eee;"></div>
        <div class="card-body">
          <div class="skeleton-title" style="height:20px; width:60%; background:#eee; margin-bottom:10px;"></div>
          <div class="skeleton-date" style="height:14px; width:30%; background:#eee; margin-bottom:10px;"></div>
          <div class="skeleton-line" style="height:14px; width:90%; background:#eee;"></div>
        </div>
      </div>
    `;
  }

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
// Render "Other Announcements"
// =======================
function renderOtherAnnouncements(all, currentId) {
  const wrapper = document.querySelector(".other-announcements-scroll");
  if (!wrapper) return;

  if (!all.length) {
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

  wrapper.innerHTML = "";

  all.forEach((item) => {
    if (item.id == currentId) return;

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

    const img = card.querySelector("img");
    const skeleton = card.querySelector(".skeleton-img");

    img.onload = () => {
      skeleton.style.display = "none";
      img.classList.remove("d-none");
    };
  });
}

// =======================
// Init
// =======================
async function initArticlePage() {
  if (!id) return;

  renderSkeletons();

  const announcement = await fetchAnnouncementById(id);
  renderArticle(announcement);

  const allAnnouncements = await fetchAllAnnouncements();
  renderOtherAnnouncements(allAnnouncements, id);

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
