       const listItems = document.querySelectorAll('.list-item-content');

        listItems.forEach(item =>{
            item.addEventListener('click', (e) =>{
                e.stopPropagation();

                const currentLi = item.closest('li');
                const currentImg = currentLi.querySelector('.calendar-image');
                const arrow = currentLi.querySelector('.arrow');
                const isVisible = window.getComputedStyle(currentImg).display === 'block';

                document.querySelectorAll('.calendar-image').forEach(img => {
                    img.style.display = 'none';
                });
                document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));

                if (!isVisible){
                    currentImg.style.display = 'block';
                    arrow.classList.add('open');
                };
            });
        });



        document.addEventListener('DOMContentLoaded', () => {
            const video = document.getElementById('faqVideo');
            const faqsSection = document.getElementById('faqs');

            window.addEventListener('scroll', () => {
                const faqsRect = faqsSection.getBoundingClientRect();
                const middleY = window.innerHeight / 2;

                if (faqsRect.top < middleY && faqsRect.bottom > middleY) {
                    // Middle of screen is inside FAQ section
                    video.classList.remove('fixed', 'hidden');
                    video.classList.add('enlarged');
                    video.play();
                } else if (faqsRect.top >= middleY) {
                    // Above FAQ
                    video.classList.remove('enlarged', 'hidden');
                    video.classList.add('fixed');
                    video.pause();
                } else {
                    // Below FAQ (in next section)
                    video.classList.remove('fixed', 'enlarged');
                    video.classList.add('hidden');
                    video.pause();
                }
            });

            video.classList.add('fixed');

        });

    /* --- home.html initializer --- */
function initHome() {
  console.log("Home page initialized");
  // put your home-specific JS here later
}


// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



// =======================
// Load FAQ Video
// =======================
async function loadFaqVideo() {
  const { data, error } = await supabaseClient
    .from("sitemedia")
    .select("*")
    .eq("type", "video")
    .order("id", { ascending: false })
    .limit(1);

  if (!error && data.length > 0) {
    const faqVideo = document.getElementById("faqVideo");
    if (faqVideo) {
      faqVideo.innerHTML = `
        <source src="${data[0].file_url}" type="video/mp4"/>
        Your browser does not support the video
      `;
      faqVideo.load(); // reload new video
    }
  }
}

// =======================
// Load Undergraduate Calendar
// =======================
async function loadUndergradCalendar() {
  const { data, error } = await supabaseClient
    .from("sitemedia")
    .select("*")
    .eq("type", "calendar")
    .order("id", { ascending: false })
    .limit(1);

  if (!error && data.length > 0) {
    const undergradImg = document.querySelector(
      '#academic-calendar li:nth-child(1) img'
    );
    if (undergradImg) {
      undergradImg.src = data[0].file_url;
      undergradImg.alt = "Undergraduate Calendar";
    }
  }
}

// =======================
// Load Graduate Calendar
// =======================
async function loadGradCalendar() {
  const { data, error } = await supabaseClient
    .from("sitemedia")
    .select("*")
    .eq("type", "calendar_grad")
    .order("id", { ascending: false })
    .limit(1);

  if (!error && data.length > 0) {
    const gradImg = document.querySelector(
      '#academic-calendar li:nth-child(2) img'
    );
    if (gradImg) {
      gradImg.src = data[0].file_url;
      gradImg.alt = "Graduate Calendar";
    }
  }
}


document.getElementById("faq-btn").addEventListener("click", function () {
    // Correctly navigate to the Express route defined in server.js
    window.location.href = "/faq"; 
});

async function loadTodayAnnouncements() {
  const container = document.getElementById("announcements-container");

  // Fetch announcements for today
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .gte("scheduled_datetime", today + "T00:00:00")
    .lte("scheduled_datetime", today + "T23:59:59")
    .order("scheduled_datetime", { ascending: false });

  container.innerHTML = ""; // clear old content

  if (error) {
    container.innerHTML = `<p>Error loading announcements.</p>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p>No latest Announcements</p>`;
    return;
  }

  // Render cards
  data.forEach(item => {
    const dateObj = new Date(item.scheduled_datetime);
    const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
    const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const card = document.createElement("div");
    card.className = "update-card";
    card.innerHTML = `
      <div class="card-bg-shape"></div>
      <img src="${item.image_url || 'img/CARD-BG.png'}" alt="announcement image" class="card-image">
      <div class="card-content">
        <h3><b>${item.title}</b></h3>
        <p class="date"><b>${formattedDate}</b></p>
        <p class="description">${item.details}</p>
        <a href="announcement_article.html?id=${item.id}" class="read-more">Read more!</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// =======================
// Visitor Tracking (Persistent per session)
// =======================

let visitorId = sessionStorage.getItem("visitorId") || null;
const EXIT_DELAY = 3000; 
let navigatingInternally = false; 

// Log a new visit only if no visitorId exists
async function logVisit() {
  if (visitorId) {
    console.log("✅ Visitor already logged, ID:", visitorId);
    return;
  }

  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Computer";

  try {
    const { data, error } = await supabaseClient
      .from("visitors")
      .insert([{ 
        device_type: deviceType, 
        visited_at: new Date().toISOString(), 
        exited_at: null, 
        video_replays: 0 
      }])
      .select("id")
      .single();

    if (error) throw error;

    visitorId = data.id;
    sessionStorage.setItem("visitorId", visitorId); // save for this session
    console.log("✅ New visitor logged, ID:", visitorId);
  } catch (err) {
    console.error("❌ Error logging visitor:", err.message);
  }
}

// Log visitor exit, same as before
async function logVisitorExit() {
  if (!visitorId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/visitors?id=eq.${visitorId}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ exited_at: new Date().toISOString() }),
      keepalive: true
    });
    console.log("✅ Visitor exit logged:", visitorId);
  } catch (err) {
    console.error("❌ Failed to log exit:", err);
  }
}

// -----------------------
// Reset exit timestamp when returning to page
// -----------------------
window.addEventListener("focus", async () => {
  navigatingInternally = false; // reset flag
  if (!visitorId) return;
  try {
    await supabaseClient.from("visitors")
      .update({ exited_at: null })
      .eq("id", visitorId);
  } catch (err) {
    console.error("❌ Failed to reset exited_at:", err.message);
  }
});


// -----------------------
// Check if an <a> click is internal
// -----------------------
function isInternalLink(event) {
  const anchor = event.target.closest('a');
  if (!anchor || !anchor.href) return false;

  try {
    const destUrl = new URL(anchor.href, window.location.origin);
    return destUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

// -----------------------
// Event listeners
// -----------------------

// Handle internal link clicks
document.addEventListener("click", (event) => {
  if (isInternalLink(event)) {
    navigatingInternally = true; // prevent exit logging
    event.preventDefault();
    const href = event.target.closest('a').href;
    window.location.href = href; // navigate manually
  }
});

// Only log exit if NOT navigating internally
window.addEventListener("beforeunload", () => {
  if (!navigatingInternally) logVisitorExit();
});

window.addEventListener("pagehide", () => {
  if (!navigatingInternally) logVisitorExit();
});

// Visibility change (tab switch)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setTimeout(() => {
    if (!navigatingInternally) logVisitorExit();
  }, EXIT_DELAY);
});

// Reset exit timestamp when returning to page
window.addEventListener("focus", async () => {
  navigatingInternally = false; // reset internal navigation flag
  if (!visitorId) return;
  try {
    await supabaseClient.from("visitors")
      .update({ exited_at: null })
      .eq("id", visitorId);
  } catch (err) {
    console.error("❌ Failed to reset exited_at:", err.message);
  }
});

// -----------------------
// FAQ Video replay logging
// -----------------------
async function logReplay() {
  if (!visitorId) return;

  try {
    const { data, error } = await supabaseClient
      .from("visitors")
      .select("video_replays")
      .eq("id", visitorId)
      .single();

    if (error) throw error;

    const currentCount = data?.video_replays || 0;

    await supabaseClient
      .from("visitors")
      .update({ video_replays: currentCount + 1 })
      .eq("id", visitorId);

    console.log("🎬 Video replay logged for visitor:", visitorId);
  } catch (err) {
    console.error("❌ Failed to log video replay:", err.message);
  }
}

// Attach replay events
document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Log visitor
  await logVisit();

  // 2️⃣ Load video first
  await loadFaqVideo();

  const videoElement = document.getElementById("faqVideo");
  if (!videoElement) return;

  // Make video muted to avoid autoplay block
  videoElement.muted = true;

  let isLogging = false;

  // Log each play (optional: remove if you only want to log replays)
  videoElement.addEventListener("play", async () => {
    if (!isLogging) {
      isLogging = true;
      await logReplay();
      isLogging = false;
    }
  });

  // Log each ended loop
  videoElement.addEventListener("ended", async () => {
    if (isLogging) return;
    isLogging = true;
    try {
      await logReplay();
    } finally {
      isLogging = false;
      setTimeout(() => videoElement.play(), 200); // loop video
    }
  });

  // Optionally, start video automatically if muted
  videoElement.play();

  // Load other data
  loadUndergradCalendar();
  loadGradCalendar();
  loadTodayAnnouncements();
});

// 🚫 Prevent logging again when only the hash changes
window.addEventListener("hashchange", () => {
  console.log("Hash navigation detected — no new visitor log created.");
});












