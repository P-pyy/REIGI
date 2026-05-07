import { supabaseClient } from '/js/supabase-client.js';

supabaseClient.auth.getSession().then(({ data }) => {
  console.log("🧭 Current Supabase session:", data.session ? "Authenticated" : "Anon");
});


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

  
  if (video) {
    video.classList.add('fixed');
  }

  
  if (!video || !faqsSection) return;

    window.addEventListener('scroll', () => {
    const faqsRect = faqsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (faqsRect.top < viewportHeight && faqsRect.bottom > 0) {
      video.classList.remove('hidden');
      video.classList.add('enlarged');
      video.style.position = 'fixed'; 
      video.play();
    } 
    else {
      video.classList.remove('enlarged');
      video.classList.add('hidden');
      video.style.position = 'static';
      video.pause();
    }
  });

});


function initHome() {
  console.log("Home page initialized");
}


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
      faqVideo.src = data[0].file_url; 
      faqVideo.load(); 
      faqVideo.play().catch(() => {
        console.log("Autoplay blocked, user interaction required.");
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFaqVideo();
});

document.addEventListener("visibilitychange", () => {
  if (!faqVideo) return;

  if (document.hidden) {

    faqVideo.pause();
    console.log("⏸️ Tab hidden — video paused");
  } else {
    const faqsSection = document.getElementById("faqs");
    if (faqsSection) {
      const faqsRect = faqsSection.getBoundingClientRect();
      const middleY = window.innerHeight / 2;

      if (faqsRect.top < middleY && faqsRect.bottom > middleY) {
        faqVideo
          .play()
          .then(() => console.log(" Video resumed automatically"))
          .catch(() => {
            console.log(" Autoplay blocked — waiting for user interaction...");
            const resumeHandler = () => {
              faqVideo.play();
              console.log(" Video resumed after user interaction");
              document.removeEventListener("click", resumeHandler);
            };
            document.addEventListener("click", resumeHandler);
          });
      }
    }
  }
});

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

document.addEventListener("DOMContentLoaded", () => {
  const faqBtn = document.getElementById("faq-btn");
  if (faqBtn) {
    faqBtn.addEventListener("click", function () {
      window.location.href = "/faq"; 
    });
  }
});


async function loadTodayAnnouncements() {
  const container = document.getElementById("announcements-container");
  if (!container) return; 

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .gte("scheduled_datetime", today + "T00:00:00")
    .lte("scheduled_datetime", today + "T23:59:59")
    .order("scheduled_datetime", { ascending: false });

  container.innerHTML = ""; 

  if (error) {
    container.innerHTML = `<p>Error loading announcements.</p>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p>No latest Announcements</p>`;
    return;
  }

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
        <a href="/announcement-article?id=${item.id}" class="read-more">Read more!</a>
      </div>
    `;
    container.appendChild(card);
  });
}

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


document.addEventListener("DOMContentLoaded", () => {
  loadUndergradCalendar();
  loadGradCalendar();
  loadTodayAnnouncements();
});


document.addEventListener("DOMContentLoaded", () => {
  supabaseClient
    .channel("realtime:announcements")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "announcements" },
      async (payload) => {
        console.log("📢 Realtime announcement change detected:", payload);
        await loadTodayAnnouncements();
      }
    )
    .subscribe();

  supabaseClient
    .channel("realtime:sitemedia_video")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sitemedia" },
      async (payload) => {
        if (payload.new?.type === "video" || payload.old?.type === "video") {
          console.log("🎥 FAQ video updated — reloading...");
          await loadFaqVideo();
        }
      }
    )
    .subscribe();

  supabaseClient
    .channel("realtime:sitemedia_calendar")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sitemedia" },
      async (payload) => {
        if (payload.new?.type === "calendar" || payload.old?.type === "calendar") {
          console.log("📅 Undergraduate calendar updated — reloading...");
          await loadUndergradCalendar();
        }
      }
    )
    .subscribe();

  supabaseClient
    .channel("realtime:sitemedia_calendar_grad")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sitemedia" },
      async (payload) => {
        if (payload.new?.type === "calendar_grad" || payload.old?.type === "calendar_grad") {
          console.log("🎓 Graduate calendar updated — reloading...");
          await loadGradCalendar();
        }
      }
    )
    .subscribe();
});


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

logVisitor();

window.addEventListener("beforeunload", async () => {
  const visitorSessionId = getCookie("visitor_session_id");
  if (!visitorSessionId) return;

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

const faqVideo = document.getElementById("faqVideo");

if (faqVideo) {
  console.log("🎥 Replay tracking active for visitor.");

  faqVideo.addEventListener("timeupdate", () => {
    if (faqVideo.currentTime >= faqVideo.duration - 0.3) {
      if (!faqVideo.hasCountedReplay) {
        faqVideo.hasCountedReplay = true; 
        console.log("🔁 User replayed the FAQ video!");

        updateReplayCount();

        setTimeout(() => faqVideo.hasCountedReplay = false, 1000);
      }
    }
  });
}

async function updateReplayCount() {
  const visitorId = getCookie("visitor_session_id");
  if (!visitorId) return;

  try {
    await fetch("/api/update-replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId }),
    });
    console.log(" Replay count sent to server");
  } catch (err) {
    console.error(" Failed to update replay count:", err);
  }
}
