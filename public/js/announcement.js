import { supabaseClient } from '/js/supabase-client.js';

// Global State
let allAnnouncements = [];

document.addEventListener("DOMContentLoaded", () => {
  initAnnouncementsIndex();
  attachNavigationHandlers(); 
});

async function initAnnouncementsIndex() {
  const loadingOverlay = document.getElementById("loading-overlay");
  const tableBody = document.querySelector(".announcement-table tbody");

  if (loadingOverlay) loadingOverlay.classList.remove("d-none");
  if (tableBody) tableBody.innerHTML = ""; 

  allAnnouncements = await fetchAnnouncements();
  renderAnnouncementTable(allAnnouncements);

  if (loadingOverlay) loadingOverlay.classList.add("d-none");

  // Realtime Updates
  supabaseClient
    .channel('realtime:announcements')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, async () => {
       allAnnouncements = await fetchAnnouncements();
       renderAnnouncementTable(allAnnouncements);
    })
    .subscribe();
}

async function fetchAnnouncements() {
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .order("scheduled_datetime", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error.message);
    return [];
  }
  return data || [];
}

function renderAnnouncementTable(announcements) {
  const tableBody = document.querySelector(".announcement-table tbody");
  if (!tableBody) return;

  if (!announcements || announcements.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No announcements found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = ""; 

  announcements.forEach((item) => {
    const dateObj = new Date(item.scheduled_datetime);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

    const row = document.createElement("tr");
    
    // 🎯 LOGIC: 
    // 1. First TD has class "toggle-cell" to match your CSS.
    // 2. Icon uses "ph-bold ph-caret-down" to match your icon set.
    row.innerHTML = `
      <td class="toggle-cell" style="vertical-align: top; padding-top: 1rem;">
          <i class="ph-bold ph-caret-down"></i>
      </td>

      <td style="vertical-align: top; padding-top: 1rem;">${item.id}</td>

      <td style="vertical-align: top; padding-top: 1rem; font-weight: 600;">${item.title}</td>
      
      <td>
        <div class="expandable-content">
           ${item.details || "<span class='text-muted'>No details.</span>"}
        </div>
      </td>

      <td style="vertical-align: top; padding-top: 1rem;">
        ${item.image_url 
          ? `<img src="${item.image_url}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` 
          : `<span class="text-muted small">No Img</span>`}
      </td>

      <td style="vertical-align: top; padding-top: 1rem;">${dateStr}</td>

      <td style="vertical-align: top; padding-top: 1rem;">${timeStr}</td>

      <td style="vertical-align: top; padding-top: 1rem;">
         <button class="btn btn-sm text-primary edit-btn" data-id="${item.id}"><i class="ph-bold ph-pencil-simple"></i></button>
         <button class="btn btn-sm text-danger delete-btn" data-id="${item.id}"><i class="ph-bold ph-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // 🔄 Reload Icons (Crucial for dynamic content)
  if (window.PhosphorIcons) {
      window.PhosphorIcons.replace();
  }
  
  attachCollapseHandlers();
}

function attachCollapseHandlers() {
  document.querySelectorAll('.toggle-cell').forEach(td => {
    td.addEventListener('click', (e) => {
      e.preventDefault();
      const row = td.closest('tr');
      
      // Select icon (works for both <i> and auto-generated <svg>)
      const icon = td.querySelector('i, svg'); 

      row.classList.toggle('row-expanded');

      if (icon) {
        // Direct style manipulation for rotation
        icon.style.transform = row.classList.contains('row-expanded') 
          ? "rotate(180deg)" 
          : "rotate(0deg)";
      }
    });
  });
}

function attachNavigationHandlers() {
    const addBtn = document.getElementById("add-announcement-btn");
    const backBtn = document.querySelector(".back-btn");
    const tableContainer = document.querySelector(".container-group");
    const editFormContainer = document.getElementById("edit-form-container");
    const backContainer = document.querySelector(".back-container");

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            tableContainer.classList.add("d-none");
            addBtn.parentElement.classList.add("d-none");
            
            if (editFormContainer) {
                editFormContainer.style.display = "block"; 
                editFormContainer.innerHTML = "<h3>Editor Placeholder</h3>"; 
            }
            if (backContainer) backContainer.classList.remove("d-none");
        });
    }

    if (backBtn) {
        backBtn.addEventListener("click", (e) => {
            if (editFormContainer && editFormContainer.style.display === "block") {
                 e.preventDefault();
                 editFormContainer.style.display = "none";
                 tableContainer.classList.remove("d-none");
                 if (addBtn) addBtn.parentElement.classList.remove("d-none");
                 // Don't hide backContainer if you want it to act as 'Back to Dashboard'
            }
        });
    }
}