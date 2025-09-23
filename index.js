
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

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});


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

// =======================
// Init
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  await loadFaqVideo();
  await loadUndergradCalendar();
  await loadGradCalendar();
  await loadTodayAnnouncements();
});


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

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
    return "Mobile";
  }
  return "Computer";
}

async function logVisitorDevice() {
  if (sessionStorage.getItem("deviceLogged")) {
    console.log("Already logged this session");
    return;
  }

  const deviceType = getDeviceType();
  const { error } = await supabaseClient
    .from("visitors")
    .insert([{ device_type: deviceType }]);

  if (error) {
    console.error("Error logging device:", error.message);
  } else {
    console.log("Device logged:", deviceType);
    sessionStorage.setItem("deviceLogged", "true");
  }
}

// log once per session
logVisitorDevice();
