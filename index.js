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

            document.getElementById('faq-btn').addEventListener('click', () => {
                faqsSection.scrollIntoView({ behavior: 'smooth' });
            });
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
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";

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
    window.location.href = "faq_user_menu.html";
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

let visitorId = null;
let exitTimer = null;

// =======================
// Log Visit
// =======================
// async function logVisit() {
//   // Always check sessionStorage only (new session after browser close)
//   visitorId = sessionStorage.getItem("visitorId");

//   if (visitorId && visitorId !== "null" && visitorId !== "") {
//     console.log("✅ Returning visitor in same session:", visitorId);

//     // Just update timestamps
//     await supabaseClient
//       .from("visitors")
//       .update({
//         visited_at: new Date().toISOString(),
//         exited_at: null
//       })
//       .eq("id", visitorId);

//     return;
//   }

//   // New session → insert new row
//   const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Computer";

//   const { data, error } = await supabaseClient
//     .from("visitors")
//     .insert([{
//       device_type: deviceType,
//       visited_at: new Date().toISOString(),
//       exited_at: null,
//       video_replays: 0,
//     }])
//     .select("id")
//     .single();

//   if (error) {
//     console.error("❌ Error logging new visitor:", error.message);
//     return;
//   }

//   visitorId = data.id;
//   sessionStorage.setItem("visitorId", visitorId); // 🚫 removed localStorage

//   console.log("✅ New visitor logged, ID:", visitorId);
// }

async function logVisit() {
  // Reuse ID from localStorage across pages
  visitorId = localStorage.getItem("visitorId");

  if (visitorId) {
    console.log("✅ Returning visitor:", visitorId);

    // Just update timestamps (don’t insert)
    await supabaseClient
      .from("visitors")
      .update({
        visited_at: new Date().toISOString(),
        exited_at: null
      })
      .eq("id", visitorId);

    return;
  }

  // Otherwise → first-time visitor this session
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Computer";

  const { data, error } = await supabaseClient
    .from("visitors")
    .insert([{
      device_type: deviceType,
      visited_at: new Date().toISOString(),
      exited_at: null,
      video_replays: 0,
    }])
    .select("id")
    .single();

  if (error) {
    console.error("❌ Error logging new visitor:", error.message);
    return;
  }

  visitorId = data.id;

  // Persist across pages until tab closes
  localStorage.setItem("visitorId", visitorId);

  console.log("✅ New visitor logged, ID:", visitorId);
}




const EXIT_DELAY = 30000; // 30 seconds

// =======================
// Log Exit (normal async)
// =======================
async function logExit() {
  if (!visitorId) return;
  try {
    const { error } = await supabaseClient
      .from("visitors")
      .update({ exited_at: new Date().toISOString() })
      .eq("id", visitorId);

    if (error) console.error("❌ Error logging exit:", error.message);
    else console.log("✅ Exit logged after inactivity:", visitorId);
  } catch (e) {
    console.error("❌ Exit log failed:", e);
  }
}

// =======================
// Handle Tab Visibility
// =======================
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // If tab hidden → start 30s timer
    exitTimer = setTimeout(() => {
      logExit();
    }, EXIT_DELAY);
  } else {
    // If user comes back before 30s → cancel exit + keep active
    clearTimeout(exitTimer);
    if (visitorId) {
      supabaseClient.from("visitors")
        .update({ exited_at: null })
        .eq("id", visitorId);
    }
  }
});


// =======================
// Exit on tab close / external nav
// =======================
window.addEventListener("beforeunload", (e) => {
  if (!visitorId) return;

  const activeEl = document.activeElement;
  const isInternalNav =
    activeEl?.tagName === "A" &&
    activeEl.href &&
    activeEl.href.startsWith(window.location.origin);

  // Skip if just navigating within same site (like faq_user_menu.html or #hash links)
  if (isInternalNav) {
    console.log("⏩ Skipping exit log (internal navigation to:", activeEl.href, ")");
    return;
  }

  // Otherwise → tab close, refresh, or external site → log exit
  const payload = JSON.stringify({ exited_at: new Date().toISOString() });

  navigator.sendBeacon(
    `${SUPABASE_URL}/rest/v1/visitors?id=eq.${visitorId}`,
    new Blob([payload], { type: "application/json" })
  );

  fetch(`${SUPABASE_URL}/rest/v1/visitors?id=eq.${visitorId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: payload,
    keepalive: true
  }).catch(err => console.error("Exit log failed:", err));

  // ✅ Cleanup visitorId only after logging
  localStorage.removeItem("visitorId");
  sessionStorage.removeItem("visitorId");
});










// =======================
// Visitor Tracking Helpers
// =======================
function hasVisitorLogged() {
  return sessionStorage.getItem("visitorLogged") === "true";
}

function setVisitorLogged(id) {
  sessionStorage.setItem("visitorLogged", "true");
  sessionStorage.setItem("visitorId", id);
  localStorage.setItem("visitorId", id);
}


// =======================
// Init on page load
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // trackVisitor(); // ✅ will run once per session only
  loadFaqVideo();
  loadUndergradCalendar();
  loadGradCalendar();
  loadTodayAnnouncements();
  logVisit();
});

// 🚫 Prevent logging again when only the hash changes
window.addEventListener("hashchange", () => {
  console.log("Hash navigation detected — no new visitor log created.");
});


// // =======================
// // Track exit 
// // =======================
// window.addEventListener("beforeunload", () => {
//   logExit();
// });


// Track FAQ video replays
document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById("faqVideo");

  if (videoElement) {
    // First play
    videoElement.addEventListener("play", async () => {
      await logReplay();
    }, { once: true });

    // Each time the video loops
    videoElement.addEventListener("ended", async () => {
      await logReplay();
      videoElement.play(); // keep looping
    });
  }
});

async function logReplay() {
  const visitorId = sessionStorage.getItem("visitorId") || localStorage.getItem("visitorId");
  if (!visitorId) {
    console.error("No visitor session found for replay log.");
    return;
  }

  // Fetch current replays for this visitor
  const { data, error: fetchError } = await supabaseClient
    .from("visitors")
    .select("video_replays")
    .eq("id", visitorId)
    .single();

  if (fetchError) {
    console.error("Error fetching visitor row:", fetchError.message);
    return;
  }

  const currentCount = data?.video_replays || 0;

  // Increment replay count
  const { error: updateError } = await supabaseClient
    .from("visitors")
    .update({ video_replays: currentCount + 1 })
    .eq("id", visitorId);

  if (updateError) {
    console.error("Error updating video replay:", updateError.message);
  }
}

window.addEventListener("focus", async () => {
  if (visitorId) {
    await supabaseClient.from("visitors")
      .update({ exited_at: null })
      .eq("id", visitorId);
  }
});










