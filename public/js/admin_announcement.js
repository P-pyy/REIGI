import { supabaseClient } from '/js/supabase-client.js';

// =======================
// Check Admin Login
// =======================
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";  // Redirect if not logged in
  } else {
    // Set the authenticated session to use admin access rights
    supabaseClient.auth.setSession(session.access_token);
  }
})();

// =======================
// DOMContentLoaded
// =======================
window.addEventListener("DOMContentLoaded", async function () {
  const tbody = document.querySelector(".announcement-table tbody");
  const overlay = document.getElementById("loading-overlay");

  function showLoading() { overlay.classList.add("show"); }
  function hideLoading() { overlay.classList.remove("show"); }

  // Fetch announcements
  async function fetchAnnouncements() {
    showLoading();
    const { data, error } = await supabaseClient
      .from("announcements")
      .select("*")
      .order("scheduled_datetime", { ascending: false });
    hideLoading();
    if (error) {
      console.error("Error fetching announcements:", error.message);
      return [];
    }
    return data;
  }

  // Render table
function renderTable(announcements) {
  tbody.innerHTML = "";

  announcements.forEach((item, index) => {  //  add index here
    const dateObj = new Date(item.scheduled_datetime);

    const formattedDate = dateObj.toLocaleDateString("en-PH", { 
      year: "2-digit", 
      month: "2-digit", 
      day: "2-digit" 
    });
    const formattedTime = dateObj.toLocaleTimeString("en-PH", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    });

    const row = document.createElement("tr");
    row.classList.add("fade-in");
    row.innerHTML = `
      <td>${index + 1}</td>   <!--  Use index instead of DB id -->
      <td>${item.title}</td>
      <td>${item.details}</td>
      <td>
        <img src="${item.image_url}" 
             alt="announcement image" 
             style="width:60px; height:auto; border-radius:4px;">
      </td>
      <td>${formattedDate}</td>
      <td>${formattedTime}</td>
      <td>
        <a href="#" class="text-primary me-2 edit-link" data-id="${item.id}">Edit</a>
        <a href="#" class="text-danger trash-icon" data-id="${item.id}">
          <i class="ph ph-trash"></i>
        </a>
      </td>
    `;
    tbody.appendChild(row);
  });


    // Delete
    document.querySelectorAll(".trash-icon").forEach(btn => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const id = this.dataset.id;
        if (confirm("Are you sure you want to delete this announcement?")) {
          const { error } = await supabaseClient.from("announcements").delete().eq("id", id);
          if (error) alert("Failed to delete: " + error.message);
          else {
            const announcements = await fetchAnnouncements();
            renderTable(announcements);
          }
        }
      });
    });


  // Edit
document.querySelectorAll(".edit-link").forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    const id = link.dataset.id;

    const tableCard = document.querySelector(".admin-announcement-card");
    const addBtn = document.getElementById("add-announcement-btn");
    const formContainer = document.getElementById("edit-form-container");

    tableCard.style.display = "none";
    addBtn.style.display = "none";

    // ✅ Fetch the EJS-rendered route instead of static file
    const res = await fetch("/admin/announcement_edit");
    formContainer.innerHTML = await res.text();
    formContainer.style.display = "block";

    // ✅ Import JS from public folder (served statically)
    setTimeout(() => {
      import("/js/announcement_edit.js")
        .then(module => module.initAnnouncementEdit(id))
        .catch(err => console.error("Failed to load announcement_edit.js:", err));
    }, 50);
  });
});

if (window.PhosphorIcons) window.PhosphorIcons.replace();
  }


  // Initial fetch & render
const announcements = await fetchAnnouncements();
renderTable(announcements);

// =======================
// Enable Supabase Realtime Updates
// =======================
supabaseClient
  .channel('realtime:announcements')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'announcements' },
    async (payload) => {
      console.log("📡 Realtime update received:", payload.eventType);

      const announcements = await fetchAnnouncements();
      renderTable(announcements);
    }
  )
  .subscribe();


});

// =======================
// Add New Announcement
// =======================
document.getElementById("add-announcement-btn").addEventListener("click", async () => {
  const tableCard = document.querySelector(".admin-announcement-card");
  const addBtn = document.getElementById("add-announcement-btn");
  const formContainer = document.getElementById("edit-form-container");

  tableCard.style.display = "none";
  addBtn.style.display = "none";

  const res = await fetch("/admin/announcement_edit");
  formContainer.innerHTML = await res.text();
  formContainer.style.display = "block";

  setTimeout(() => {
     import("/js/announcement_edit.js")
      .then(module => module.initAnnouncementEdit()) // new announcement
      .catch(err => console.error(err));
  }, 50);
});
