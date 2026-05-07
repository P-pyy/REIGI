import { supabaseClient } from '/js/supabase-client.js';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function fetchAnnouncementById(id) {
  const { data, error } = await supabaseClient
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

async function fetchAllAnnouncements() {
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*", { head: false })
    .order("scheduled_datetime", { ascending: false });

  if (error) {
    console.error("❌ Error fetching announcements:", error.message);
    return [];
  }
  return data || [];
}

function renderArticle(announcement) {
  const container = document.querySelector(".article-placeholder");
  if (!container) return;

  let title, subtitle, text, img;

  if (!announcement) {
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

  requestAnimationFrame(() => {
    const card = container.querySelector(".article-card");
    if (card) card.style.opacity = "1";
  });
}

function renderSkeletons() {
  const container = document.querySelector(".article-placeholder");
  const section = document.querySelector(".announcement-wrapper");

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

  if (section) {
    section.style.display = "none"; 
  }
}

function renderOtherAnnouncements(all, currentId) {
  const wrapper = document.querySelector(".other-announcements-scroll");
  const section = document.querySelector(".announcement-wrapper");
  if (!wrapper || !section) return;

  const otherAnnouncements = all.filter(item => item.id != currentId);

  if (otherAnnouncements.length === 0) {
    section.style.display = "none";
    return;
  } else {
    section.style.display = "block";
  }

  wrapper.innerHTML = "";

  otherAnnouncements.forEach((item) => {
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
            <a href="/announcement-article?id=${item.id}" class="read-more">
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

async function initArticlePage() {
  if (!id) return;

  renderSkeletons(); 

  const announcement = await fetchAnnouncementById(id);
  renderArticle(announcement);

  const allAnnouncements = await fetchAllAnnouncements();
  renderOtherAnnouncements(allAnnouncements, id);

  supabaseClient
    .channel('realtime:announcements')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      async (payload) => {
        console.log("📡 Realtime update:", payload.eventType);

        const updated = await fetchAnnouncementById(id);
        renderArticle(updated);

        const all = await fetchAllAnnouncements();
        renderOtherAnnouncements(all, id);
      }
    )
    .subscribe();



  window.PhosphorIcons?.replace?.();
}

document.addEventListener("DOMContentLoaded", initArticlePage);
