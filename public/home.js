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
    const middleY = window.innerHeight / 2;

    if (faqsRect.top < middleY && faqsRect.bottom > middleY) {
      video.classList.remove('fixed', 'hidden');
      video.classList.add('enlarged');
      video.play();
    } else if (faqsRect.top >= middleY) {
      video.classList.remove('enlarged', 'hidden');
      video.classList.add('fixed');
      video.pause();
    } else {
      video.classList.remove('fixed', 'enlarged');
      video.classList.add('hidden');
      video.pause();
    }
  });
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
      faqVideo.src = data[0].file_url; // directly set src on video element
      faqVideo.load(); // reload video
      faqVideo.play().catch(() => {
        // autoplay might be blocked by browser
        console.log("Autoplay blocked, user interaction required.");
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFaqVideo(); // load the video when page loads
});


// Handle visibility change (tab switching)
document.addEventListener("visibilitychange", () => {
  if (!faqVideo) return;

  if (document.hidden) {
    // 🔇 Pause when tab is hidden
    faqVideo.pause();
    console.log("⏸️ Tab hidden — video paused");
  } else {
    // ▶️ Try to resume when tab is visible
    const faqsSection = document.getElementById("faqs");
    if (faqsSection) {
      const faqsRect = faqsSection.getBoundingClientRect();
      const middleY = window.innerHeight / 2;

      if (faqsRect.top < middleY && faqsRect.bottom > middleY) {
        faqVideo
          .play()
          .then(() => console.log("▶️ Video resumed automatically"))
          .catch(() => {
            console.log("⚠️ Autoplay blocked — waiting for user interaction...");
            // Resume once the user interacts
            const resumeHandler = () => {
              faqVideo.play();
              console.log("✅ Video resumed after user interaction");
              document.removeEventListener("click", resumeHandler);
            };
            document.addEventListener("click", resumeHandler);
          });
      }
    }
  }
});





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
  if (!container) return; // ✅ stop safely if not found


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
        <a href="/announcement-article?id=${item.id}" class="read-more">Read more!</a>
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

document.addEventListener("DOMContentLoaded", () => {
  loadUndergradCalendar();
  loadGradCalendar();
  loadTodayAnnouncements();
});



// =======================
// Realtime Subscriptions
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // 📢 Listen for ANNOUNCEMENTS changes (today’s updates)
  supabaseClient
    .channel("realtime:announcements")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "announcements" },
      async (payload) => {
        console.log("📢 Realtime announcement change detected:", payload);
        await loadTodayAnnouncements(); // Refresh announcements dynamically
      }
    )
    .subscribe();

  // 🎥 Listen for FAQ video changes
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

  // 📅 Listen for UNDERGRAD calendar changes
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

  // 🎓 Listen for GRAD calendar changes
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

// VIDEO REPLAY TRACKING
const faqVideo = document.getElementById("faqVideo");

if (faqVideo) {
  console.log("🎥 Replay tracking active for visitor.");

  // Track how many times the video loops
  faqVideo.addEventListener("timeupdate", () => {
    // When the video reaches the end (within 0.3 seconds), count a replay
    if (faqVideo.currentTime >= faqVideo.duration - 0.3) {
      if (!faqVideo.hasCountedReplay) {
        faqVideo.hasCountedReplay = true; // prevent multiple triggers
        console.log("🔁 User replayed the FAQ video!");

        // Example of Supabase update
        updateReplayCount();

        // Reset flag after short delay (for next loop)
        setTimeout(() => faqVideo.hasCountedReplay = false, 1000);
      }
    }
  });
}

async function updateReplayCount() {
  const visitorId = getCookie("visitor_session_id");
  if (!visitorId) {
    console.warn("⚠️ No visitor session ID found, skipping replay update.");
    return;
  }

  try {
    // Fetch the visitor record safely
    const { data, error: fetchError } = await supabaseClient
      .from("visitors")
      .select("video_replays")
      .eq("visitor_id", visitorId)
      .maybeSingle(); // 👈 prevents hard error if no row exists

    if (fetchError) {
      console.error("❌ Error fetching visitor replay count:", fetchError);
      return;
    }

    const currentCount = data?.video_replays || 0;
    const newCount = currentCount + 1;

    // ✅ Upsert instead of update (ensures record always exists)
    const { error: updateError } = await supabaseClient
      .from("visitors")
      .upsert(
        { visitor_id: visitorId, video_replays: newCount },
        { onConflict: "visitor_id" }
      );

    if (updateError) {
      console.error("❌ Error updating replay count:", updateError);
    } else {
      console.log("✅ Replay count updated successfully!");
      console.log("🎯 Updated replay count:", newCount);
    }
  } catch (err) {
    console.error("⚠️ Unexpected error updating replay count:", err);
  }
}
