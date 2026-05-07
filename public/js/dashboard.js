import { supabaseClient } from '/js/supabase-client.js';
window.supabaseClient = supabaseClient;

let currentUser = null; 

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    alert("You must be logged in to upload media.");
    window.location.href = "/admin/login";
    return;
  }

  currentUser = session.user; 

const announcementsChannel = supabaseClient
  .channel('realtime-announcements-dashboard') 
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'announcements' },
    async (payload) => {
      console.log('🔄 Announcements table changed:', payload);

      const annNumElem = document.querySelector(".ann-num");
      if (!annNumElem) return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabaseClient
        .from("announcements")
        .select("id, scheduled_datetime")
        .gte("scheduled_datetime", startOfMonth.toISOString())
        .lte("scheduled_datetime", endOfMonth.toISOString());

      if (error) {
        console.error("Error fetching announcements this month:", error.message);
        annNumElem.textContent = "0";
        return;
      }

      annNumElem.textContent = data.length;
      annNumElem.style.visibility = "visible";
    }
  )
  .subscribe();

const visitorsChannel = supabaseClient
  .channel('realtime-visitors-dashboard') 
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'visitors' },
    async (payload) => {
      console.log('🔄 Visitors table changed:', payload);

      await loadActiveUsersChart();
      await loadDeviceTypes();
      await loadBounceRate();
      await loadTotalWebsiteVisits();
      await loadVideoReplayCount();
    }
  )
  .subscribe();

const faqsChannel = supabaseClient
  .channel('realtime-faqs-dashboard') 
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'faqs' },
    async (payload) => {
      console.log('🔄 FAQs table changed:', payload);

      await loadTopFAQs();
      await loadTotalFAQViews();
    }
  )
  .subscribe();


const sitemediaChannel = supabaseClient
  .channel('realtime-sitemedia-dashboard') 
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'sitemedia' },
    async (payload) => {
      console.log('🔄 SiteMedia table changed:', payload);

      const { data: videoData, error: videoError } = await supabaseClient
        .from("sitemedia")
        .select("uploaded_at")
        .eq("type", "video")
        .order("id", { ascending: false })
        .limit(1);

      if (!videoError && videoData?.length > 0) {
        document.getElementById("video-date").textContent =
          formatDate(videoData[0].uploaded_at);
      } else {
        document.getElementById("video-date").textContent = "No data yet";
      }

      const { data: calendarData, error: calError } = await supabaseClient
        .from("sitemedia")
        .select("uploaded_at")
        .in("type", ["calendar", "calendar_grad"])
        .order("id", { ascending: false })
        .limit(1);

      if (!calError && calendarData?.length > 0) {
        document.getElementById("calendar-date").textContent =
          formatDate(calendarData[0].uploaded_at);
      } else {
        document.getElementById("calendar-date").textContent = "No data yet";
      }
    }
  )
  .subscribe();

})();


document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const mainHeader = document.querySelector(".main-header");
  const rowSumCards = document.querySelector(".row-sum-cards");
  const chartContainer = document.querySelector(".chart-container");
  const faqCard = document.querySelector(".faq-card");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("small-sidebar");
      mainContent?.classList.toggle("adjusted");
      mainHeader?.classList.toggle("adjusted");
      rowSumCards?.classList.toggle("adjusted");
      chartContainer?.classList.toggle("adjusted");
      faqCard?.classList.toggle("adjusted");
      window.dispatchEvent(new Event("resize"));
    });
  }

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });

  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      console.log("Logout clicked");
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Logout error:", error.message);
      else window.location.href = "/admin/login";
    });
  }
});

let chart = null; 

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Active Users",
        data: [],
        borderColor: "#0055A5",
        backgroundColor: "rgba(0, 85, 165, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 0, right: 30, top: 30, bottom: 0 } },
      scales: {
        x: { title: { display: true, text: "Month" }, ticks: { align: "start" } },
        y: { title: { display: true, text: "Active users" }, ticks: { stepSize: 10, min: 0, max: 50 } }
      },
      plugins: { legend: { display: false } }
    }
  });

  loadActiveUsersChart();
});

async function loadActiveUsersChart() {
  if (!chart) return; 

  const { data, error } = await supabaseClient
    .from("visitors")
    .select("visited_at, exited_at");

  if (error) {
    console.error("Error fetching visitors:", error.message);
    return;
  }

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyActiveUsers = Array(12).fill(0);
  const now = new Date();

  data.forEach(v => {
    const visited = new Date(v.visited_at);
    const exited = v.exited_at ? new Date(v.exited_at) : now;
    const startMonth = visited.getMonth();
    const endMonth = exited.getMonth();
    for (let m = startMonth; m <= endMonth; m++) {
      monthlyActiveUsers[m]++;
    }
  });

  chart.data.labels = monthLabels;
  chart.data.datasets[0].data = monthlyActiveUsers;
  chart.update();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!chart) return;

  const legendContainer = document.getElementById("customLegend");
  if (!legendContainer) return;

  const dataset = chart.data.datasets[0];
  if (!dataset) return;

  const legendItem = document.createElement("div");
  legendItem.className = "legend-item";
  legendItem.innerHTML = `
    <span class="legend-circle"></span>
    <span class="legend-text">${dataset.label}</span>
  `;
  legendContainer.appendChild(legendItem);
});

const devCtx = document.getElementById("deviceChart");
const deviceChart = new Chart(devCtx, {
  type: "doughnut",
  data: {
    labels: ["Mobile", "Computer"],
    datasets: [{ data: [0, 0], backgroundColor: ["#CDE4FF", "#0055A5"], borderWidth: 0 }]
  },
  options: { responsive: true, cutout: "50%", plugins: { legend: { display: false } }, maintainAspectRatio: false }
});

async function loadDeviceTypes() {
  const { data, error } = await supabaseClient.from("visitors").select("device_type");
  if (error || !data) {
    console.error("Error loading device types:", error);
    return;
  }

  let mobile = 0, computer = 0;
  data.forEach(row => {
    if (row.device_type === "Mobile") mobile++;
    else if (row.device_type === "Computer") computer++;
  });

  const total = mobile + computer;
  const mPercent = total ? ((mobile / total) * 100).toFixed(0) : 0;
  const cPercent = total ? ((computer / total) * 100).toFixed(0) : 0;

  deviceChart.data.labels = ["Mobile", "Computer"];
  deviceChart.data.datasets[0].data = [mobile, computer];
  deviceChart.update();

  const labelsContainer = document.querySelector(".percentage-labels");
  labelsContainer.innerHTML = `
    <div class="percentage-item"><span>Mobile</span><span>${mPercent}%</span></div>
    <div class="percentage-item"><span>Computer</span><span>${cPercent}%</span></div>`;
}

async function loadBounceRate() {
  const { data, error } = await supabaseClient.from("visitors").select("visited_at, exited_at");
  if (error || !data) return;

  const total = data.length;
  if (total === 0) {
    document.querySelector(".bounce-percent").textContent = "0%";
    return;
  }

  let bounced = 0;
  data.forEach(v => {
    if (!v.exited_at) {
      bounced++; 
    } else {
      const start = new Date(v.visited_at).getTime();
      const exit = new Date(v.exited_at).getTime();
      const duration = (exit - start) / 1000;
      if (duration < 30) bounced++;
    }
  });

  const bounceRate = Math.round((bounced / total) * 100);
  document.querySelector(".bounce-percent").textContent = bounceRate + "%";
}

document.addEventListener("DOMContentLoaded", () => {
  loadDeviceTypes();
  loadBounceRate();
  loadVideoReplayCount(); 
  loadTotalWebsiteVisits();
  loadTopFAQs();
  loadTotalFAQViews();
  loadActiveUsersChart();
})

window.addEventListener("DOMContentLoaded", async () => {
  const annNumElem = document.querySelector(".ann-num");

  if (!annNumElem) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { data, error } = await supabaseClient
    .from("announcements")
    .select("id, scheduled_datetime")
    .gte("scheduled_datetime", startOfMonth.toISOString())
    .lte("scheduled_datetime", endOfMonth.toISOString());

  if (error) {
    console.error("Error fetching announcements this month:", error.message);
    annNumElem.textContent = "0";
    return;
  }

  annNumElem.textContent = data.length;
  annNumElem.style.visibility = "visible";
});

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}

const { data: videoData, error: videoError } = await supabaseClient
  .from("sitemedia")
  .select("uploaded_at")
  .eq("type", "video")
  .order("id", { ascending: false })
  .limit(1);

if (!videoError && videoData?.length > 0) {
  document.getElementById("video-date").textContent =
    formatDate(videoData[0].uploaded_at);
} else {
  document.getElementById("video-date").textContent = "No data yet";
}

const { data: calendarData, error: calError } = await supabaseClient
  .from("sitemedia")
  .select("uploaded_at")
  .in("type", ["calendar", "calendar_grad"])
  .order("id", { ascending: false })
  .limit(1);

if (!calError && calendarData?.length > 0) {
  document.getElementById("calendar-date").textContent =
    formatDate(calendarData[0].uploaded_at);
} else {
  document.getElementById("calendar-date").textContent = "No data yet";
}

async function loadVideoReplayCount() {
  const { data, error } = await supabaseClient
    .from("visitors")
    .select("video_replays");

  if (error) {
    console.error("Error loading video replay count:", error.message);
    return;
  }

  const totalReplays = data.reduce((sum, row) => sum + row.video_replays, 0);
  document.getElementById("video-count").textContent = totalReplays;
}

async function loadTotalWebsiteVisits() {
  const { count, error } = await supabaseClient
    .from("visitors")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total visits:", error.message);
    return;
  }

  const totalVisits = count || 0;
  const totalElem = document.querySelector(".t-website .card-number");
  const growthElem = document.querySelector(".t-website .card-subtext");
  const lastTotal = parseInt(localStorage.getItem("lastTotalVisits")) || 0;
  const diff = totalVisits - lastTotal;

  totalElem.textContent = totalVisits;

  if (growthElem) {
    if (diff > 0) {
      growthElem.innerHTML = `<i class="ph ph-caret-double-up"></i> +${diff} visits`;
      growthElem.classList.add("up");
      growthElem.classList.remove("down");
    } else {
      growthElem.textContent = "No new visits";
      growthElem.classList.remove("up", "down");
    }
  }

  localStorage.setItem("lastTotalVisits", totalVisits);
}

async function loadTopFAQs() {
  const { data, error } = await supabaseClient
    .from("faqs")
    .select("id, question_title, views, last_week_views")
    .order("views", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error loading FAQs:", error);
    return;
  }

  const faqList = document.querySelector(".faq-card ul");
  faqList.innerHTML = "";

  data.forEach(faq => {
    const trendUp = faq.views > faq.last_week_views;
    const icon = trendUp
      ? `<i class="ph ph-caret-up faq-icon-u text-success"></i>`
      : `<i class="ph ph-caret-down faq-icon-d text-danger"></i>`;

    faqList.innerHTML += `
    <li class="faq-item">
    <span class="faq-title">${faq.question_title}</span>
    <span class="faq-count">${icon} ${faq.views}</span>
  </li>
      `;
  });
}

async function getFaqStats() {
  try {
    const { data, error } = await supabaseClient
    .from('faqs')
    .select('id, question_title, details, views, last_week_views')
    .order('views', { ascending: false });


    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching FAQ stats:", err.message);
    return [];
  }
}

getFaqStats().then(faqs => {
  faqs.forEach(faq => {
    console.log(
      `Q: ${faq.question_title}\nViews: ${faq.views} (Last Week: ${faq.last_week_views})`
    );
  });
});

async function loadTotalFAQViews() {
  try {
    const { data, error } = await supabaseClient
      .from("faqs")
      .select("views, last_week_views"); 

    if (error) {
      console.error("Error fetching FAQ views:", error.message);
      return;
    }

    const totalViews = data.reduce((sum, faq) => sum + (faq.views || 0), 0);
    const totalFAQCard = document.querySelector(".total-faq .card-number");
    const cardSubtext = document.querySelector(".total-faq .card-subtext");

    if (totalFAQCard) totalFAQCard.textContent = totalViews;

    const lastWeekTotal = data.reduce((sum, faq) => sum + (faq.last_week_views || 0), 0);

    if (cardSubtext) {
      if (totalViews > lastWeekTotal) {
        cardSubtext.innerHTML = `<i class="ph ph-caret-double-up"></i> +${totalViews - lastWeekTotal} views`;
        cardSubtext.classList.add("up");
        cardSubtext.classList.remove("down");
      } else if (totalViews < lastWeekTotal) {
        cardSubtext.innerHTML = `<i class="ph ph-caret-double-down"></i> ${Math.abs(totalViews - lastWeekTotal)} views`;
        cardSubtext.classList.add("down");
        cardSubtext.classList.remove("up");
      } else {
        cardSubtext.textContent = "No change";
        cardSubtext.classList.remove("up", "down");
      }
    }

  } catch (err) {
    console.error("Unexpected error loading total FAQ views:", err.message);
  }
}


(async () => {
  const { data, error } = await supabaseClient.from("visitors").select("*").limit(1);
  console.log("Visitors test:", data, error);
})();

