import { supabaseClient } from '/js/supabase-client.js';

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

  // Load other data
  loadUndergradCalendar();
  loadGradCalendar();
  loadTodayAnnouncements();
});



// home.js 

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, minutes) {
  const d = new Date();
  d.setTime(d.getTime() + minutes * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

async function logVisitor() {
  const cookieName = "visitor_session_id";
  let visitorId = getCookie(cookieName);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setCookie(cookieName, visitorId, 30);
    console.log("New visitor session created:", visitorId);
  } else {
    console.log("Existing session:", visitorId);
  }

  const deviceType = getDeviceType();

  // ✅ Always call backend to handle exited_at reset
  try {
    await fetch("/api/log-visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId, device_type: deviceType }),
    });
  } catch (err) {
    console.error("Error logging visitor:", err);
  }
}

// Run on page load
logVisitor();

window.addEventListener("beforeunload", async () => {
  const visitorSessionId = getCookie("visitor_session_id");
  if (!visitorSessionId) return;

  // Send the exit time to Supabase
  navigator.sendBeacon(
    "/api/visitor-exit",
    JSON.stringify({ visitor_session_id: visitorSessionId, exited_at: new Date().toISOString() })
  );
});

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/windows|macintosh|linux/i.test(ua)) return "Computer";
  return "Others";
}















