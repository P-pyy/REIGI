// Supabase Import
import { supabaseClient } from '/js/supabase-client.js';

// Main DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

  // DOM Elements
  const editorSection = document.getElementById("faq-editor-section");
  const faqGrid = document.getElementById("faq-grid");
  const enrollmentSection = document.getElementById("enrollment-section");
  const documentRequestSection = document.getElementById("document-request-section");
  const addButtons = document.querySelectorAll(".add-question-btn");
  const questionTitleInput = editorSection?.querySelector("input[placeholder='Question Title']");
  const requirementInput = document.getElementById("requirementInput");
  const stepProcessInput = document.getElementById("stepProcessInput");
  const imageInput = document.getElementById("imageInput");
  const requirementContainer = document.querySelectorAll(".fill-upper")[0];
  const processContainer = document.querySelectorAll(".fill-upper")[1];
  const requirementsPreview = editorSection?.querySelector(".faq-preview ol");
  const stepsPreviewContainer = editorSection?.querySelector(".preview-text");
  const kioskTableBody = document.querySelector("#document-request-section tbody");
  const windowSelectSection = document.getElementById("container-window-select");
  const queueDashboardHeader = document.getElementById("queue-dashboard-header");
  const processingSection = document.getElementById("processing-section");
  const moveToProcessingBtns = document.querySelectorAll(".move-to-processing-btn");
  const backdrop = document.getElementById("overlay-backdrop");

  // --- NEW: Selectors for ALL popups ---
  const deletePopup = document.getElementById("delete-popup");
  const deletePopupCloseBtn = deletePopup.querySelector(".x-container a");
  const deletePopupConfirmBtn = deletePopup.querySelector(".color-btn");
  const deletePopupName = deletePopup.querySelector(".id.text");

  const logoutPopup = document.getElementById("logout-popup");
  const logoutPopupCloseBtn = logoutPopup.querySelector(".x-container a");
  const logoutPopupConfirmBtn = logoutPopup.querySelector(".color-btn");
  const logoutPopupName = logoutPopup.querySelector(".id.text");

  const processingPopup = document.getElementById("processing-popup");
  const processingPopupCloseBtn = processingPopup.querySelector(".x-container a");
  const processingPopupConfirmBtn = processingPopup.querySelector(".color-btn-yes");
  const processingPopupName = processingPopup.querySelector(".id.text");

  const confirmPopup = document.getElementById("confirm-popup");
  const confirmPopupCloseBtn = confirmPopup.querySelector(".x-container a");
  const confirmPopupConfirmBtn = confirmPopup.querySelector(".color-btn-yes");
  const confirmPopupName = confirmPopup.querySelector(".id.text");
  
  const toggleBtn = document.querySelector(".toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const mainHeader = document.querySelector(".main-header");
  const rowSumCards = document.querySelector(".row-sum-cards");
  const chartContainer = document.querySelector(".chart-container");
  const faqCard = document.querySelector(".faq-card");
  const windowButtons = document.querySelectorAll(".window-container");
  const proceedButton = document.getElementById("proceed-button");
  const windowNumberText = document.querySelector(".window-number");
  const windowStatusPills = document.querySelectorAll(".window-status-pill");
  const enrollmentTableBody = document.querySelector("#enrollment-section tbody");
  const logoutBtn = document.querySelector(".logout");

  // Data Arrays
  let requirements = [];
  let steps = [];
  let selectedWindow = null;

  // Sidebar Toggle
  toggleBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("small-sidebar");
    mainContent?.classList.toggle("adjusted");
    mainHeader?.classList.toggle("adjusted");
    rowSumCards?.classList.toggle("adjusted");
    chartContainer?.classList.toggle("adjusted");
    faqCard?.classList.toggle("adjusted");
    window.dispatchEvent(new Event("resize"));
  });

  // Logout Handler
  logoutBtn?.addEventListener("click", async () => {
    console.log("Logout clicked ✅");
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else window.location.href = "/admin/login";
  });

  // Section Toggle Logic
  document.querySelectorAll(".card-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "proceed-button") return;
      const targetId = button.getAttribute("data-target");
      
      faqGrid.classList.add("d-none");
      enrollmentSection.classList.add("d-none");
      documentRequestSection.classList.add("d-none");
      windowSelectSection.classList.add("d-none");
      queueDashboardHeader.classList.add("d-none");
      processingSection.classList.add("d-none");

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.remove("d-none");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Handle window selection
  windowButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      windowButtons.forEach(b => b.classList.remove("active-window"));
      btn.classList.add("active-window");
      selectedWindow = `WINDOW ${index + 1}`;
      console.log("Selected:", selectedWindow);
    });
  });

  // Proceed button handler
  proceedButton.addEventListener("click", () => {
    if (!selectedWindow) {
      alert("⚠️ Please select a window first!");
      return;
    }
    const confirmationModal = document.getElementById("window-confirmation-modal");
    const confirmationWindowText = document.getElementById("confirmation-window-text");
    confirmationWindowText.textContent = selectedWindow;
    confirmationModal.classList.remove("d-none");
  });

  // Confirmation modal controls
  const _confirmationModal = document.getElementById("window-confirmation-modal");
  const _closeConfirmBtn = document.getElementById("confirmation-close-btn");
  const _confirmBtn = document.getElementById("confirmation-btn");

  _closeConfirmBtn?.addEventListener("click", () => {
    _confirmationModal.classList.add("d-none");
  });

  const confirmBackdrop = _confirmationModal?.querySelector(".window-confirmation-backdrop");
  confirmBackdrop?.addEventListener("click", () => {
    _confirmationModal.classList.add("d-none");
  });

  _confirmBtn?.addEventListener("click", () => {
    _confirmationModal.classList.add("d-none");
    document.getElementById("container-window-select").classList.add("d-none");
    document.getElementById("queue-dashboard-header").classList.remove("d-none");
    document.getElementById("enrollment-section").classList.remove("d-none");
    document.getElementById("processing-section").classList.remove("d-none");
    document.getElementById("back-to-window-select").classList.remove("d-none");
    
    loadQueueData();
    loadProcessingData();

    if (windowNumberText) windowNumberText.textContent = selectedWindow;

    windowStatusPills.forEach((pill, index) => {
      const pillWindow = `WINDOW ${index + 1}`;
      if (selectedWindow === pillWindow) {
        pill.querySelector(".status-light").classList.remove("offline");
        pill.querySelector(".status-light").classList.add("online");
        pill.classList.add("active-status");
      } else {
        pill.querySelector(".status-light").classList.remove("online");
        pill.querySelector(".status-light").classList.add("offline");
        pill.classList.remove("active-status");
      }
    });
  });

  // --- REPLACED: Back button now shows #logout-popup ---
  const backToWindowSelectBtn = document.getElementById("back-to-window-select");
  backToWindowSelectBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    logoutPopupName.textContent = selectedWindow;
    logoutPopup.classList.add("is-visible");
    backdrop.classList.add("is-visible");
  });

  // --- NEW: Handlers for Logout Popup ---
  logoutPopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
  });

  logoutPopupConfirmBtn.addEventListener("click", () => {
    // This is an "Exit Window", not a full logout
    // It reloads the page to go back to the start
    window.location.reload();
  });


  async function loadQueueData() {
    if (!enrollmentTableBody) return;
    const { data, error } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "queue")
      .order("queue_no", { ascending: true });

    if (error) {
      console.error("Error loading queue:", error);
      return;
    }

    enrollmentTableBody.innerHTML = "";
    data.forEach((row, index) => {
      const tr = document.createElement("tr");
      
      // --- UPDATED: Added data-name and data-queue-no to move button ---
      let actionContent = index === 0
        ? `<div class="d-flex gap-2 align-items-center">
             <button class="btn btn-sm btn-primary move-card-button" data-id="${row.id}" data-name="${row.full_name}" data-queue-no="${row.queue_no}">Move to Processing</button>
             <button class="btn btn-sm btn-danger delete-queue-button" data-id="${row.id}" data-name="${row.full_name}">X</button>
           </div>`
        : `<span class="text-muted">Waiting</span>`;

      tr.innerHTML = `
        <td>${row.queue_no}</td>
        <td>${row.full_name}</td>
        <td>${new Date(row.created_at).toLocaleString()}</td>
        <td>${actionContent}</td>
      `;
      enrollmentTableBody.appendChild(tr);
    });

    attachQueueActionHandlers();
    attachQueueDeleteHandlers();
  }

  const style = document.createElement('style');
  style.innerHTML = `...`; // Your style tag
  document.head.appendChild(style);

  async function loadProcessingData() {
    const processingTbody = document.querySelector("#processing-section tbody");
    if (!processingTbody) return;
    const { data, error } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "processing")
      .order("queue_no", { ascending: true });

    if (error) return console.error(error);

    processingTbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      
      // --- UPDATED: Added data-name and data-queue-no to finish button ---
      tr.innerHTML = `
        <td>${row.queue_no}</td>
        <td>${row.full_name}</td>
        <td>${new Date(row.created_at).toLocaleString()}</td>
        <td>${row.window_name || "N/A"}</td>
        <td>
          <button class="btn btn-sm btn-success finish-card-button" data-id="${row.id}" data-name="${row.full_name}" data-queue-no="${row.queue_no}">Complete</button>
        </td>
      `;
      processingTbody.appendChild(tr);
    });

    attachProcessingHandlers();
  }

  // --- REPLACED: Move to Processing handler (now shows popup) ---
  function attachQueueActionHandlers() {
    document.querySelectorAll(".move-card-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const queueNo = btn.dataset.queueNo;
        
        // Set data on the popup
        processingPopup.dataset.currentId = id;
        processingPopupName.textContent = `#${queueNo} (${name})`;
        
        // Show the popup
        processingPopup.classList.add("is-visible");
        backdrop.classList.add("is-visible");
      });
    });
  }

  // --- REPLACED: Finish button handler (now shows popup) ---
  function attachProcessingHandlers() {
    document.querySelectorAll(".finish-card-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const queueNo = btn.dataset.queueNo;

        // Set data on the popup
        confirmPopup.dataset.currentId = id;
        confirmPopupName.textContent = `#${queueNo} (${name})`;

        // Show the popup
        confirmPopup.classList.add("is-visible");
        backdrop.classList.add("is-visible");
      });
    });
  }

  // --- NEW: Handlers for Processing Popup ---
  processingPopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    processingPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete processingPopup.dataset.currentId;
  });

  processingPopupConfirmBtn.addEventListener("click", async () => {
    const id = processingPopup.dataset.currentId;
    if (!id) return;

    // This is your *original* logic
    const { error } = await supabaseClient
      .from("queue")
      .update({ 
        status: "processing",
        window_name: selectedWindow // Assign to the current window
      })
      .eq("id", id)
      .is('status', 'queue'); // Race condition lock

    if (error) return alert("❌ Failed to move to processing!");

    // Hide popup and reload data
    processingPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete processingPopup.dataset.currentId;

    await loadQueueData();
    await loadProcessingData();
  });

  // --- NEW: Handlers for Confirm Finish Popup ---
  confirmPopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    confirmPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete confirmPopup.dataset.currentId;
  });

  confirmPopupConfirmBtn.addEventListener("click", async () => {
    const id = confirmPopup.dataset.currentId;
    if (!id) return;

    // This is your *original* logic
    const { error } = await supabaseClient
      .from("queue")
      .update({ status: "finished" })
      .eq("id", id);

    if (error) return alert("❌ Failed to mark as finished!");

    // Hide popup and reload data
    confirmPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete confirmPopup.dataset.currentId;

    await loadProcessingData();
  });


  async function loadFinishedData() {
    // ... (your existing function is fine)
  }

  const finishedLogsBtn = document.getElementById("finished-logs-btn");
  finishedLogsBtn?.addEventListener("click", async () => {
    await loadFinishedData();
  });

  // --- REPLACED: Delete X handler (now shows popup) ---
  function attachQueueDeleteHandlers() {
    document.querySelectorAll(".delete-queue-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // Stop any link behavior
        
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        // Store the ID on the popup itself
        deletePopup.dataset.currentId = id;
        
        // Set the name in the popup text
        deletePopupName.textContent = name;

        // Show the popup AND the backdrop
        deletePopup.classList.add("is-visible");
        backdrop.classList.add("is-visible");
      });
    });
  }

  // --- NEW: Handlers for Delete Popup ---
  deletePopupConfirmBtn.addEventListener("click", async () => {
    const id = deletePopup.dataset.currentId;
    if (!id) return; 

    const { error } = await supabaseClient
      .from("queue")
      .delete()
      .eq("id", id);

    if (error) {
      alert("❌ Failed to remove from queue!");
    }

    // Hide the popup and backdrop
    deletePopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete deletePopup.dataset.currentId;
    
    if (!error) {
      loadQueueData();
    }
  });

  deletePopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deletePopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete deletePopup.dataset.currentId;
  });

  // --- NEW: Universal Backdrop Click Handler ---
  backdrop.addEventListener("click", () => {
    // This will close ANY open modal
    deletePopup.classList.remove("is-visible");
    logoutPopup.classList.remove("is-visible");
    processingPopup.classList.remove("is-visible");
    confirmPopup.classList.remove("is-visible");
  });

  // ... (rest of your file: Show FAQ Editor, Add/Render Requirements, etc.) ...
  // ... (These functions are not related to the popups and are fine) ...

  // Realtime Updates
  supabaseClient.channel("realtime-queue")
    .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, async (payload) => {
      console.log("Queue changed:", payload);
      await loadQueueData();
      await loadProcessingData();
      await loadFinishedData();
    })
    .subscribe();

  supabaseClient.channel("realtime-kiosk")
    .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async (payload) => {
      console.log("🔄 Kiosk table changed:", payload);
      await loadKioskData();
    })
    .subscribe();

  // Initial Load
  loadKioskData();
  loadQueueData();
  loadFinishedData();
});