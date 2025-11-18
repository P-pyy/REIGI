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
  const savedWindow = localStorage.getItem("activeWindow");
  const logoutBtn = document.querySelector(".logout");

  
  // Data Arrays
  let requirements = [];
  let steps = [];
  let selectedWindow = null;
  let lastSectionId = 'faq-grid';

  queueDashboardHeader.classList.add("d-none");
  enrollmentSection.classList.add("d-none");
  processingSection.classList.add("d-none");


  let tabId = localStorage.getItem("tabId");
  if (!tabId) {
      tabId = crypto.randomUUID();
      localStorage.setItem("tabId", tabId);
  }

  if (savedWindow) {
    proceedButton?.classList.add("d-none");
    windowButtons.forEach(btn => btn.classList.add("d-none"));
}


  //  Resume Active Window ---
  window.addEventListener("load", async () => {
    const savedWindow = localStorage.getItem("activeWindow");
    if (!savedWindow) return; // No active window, keep selection UI visible

    try {
        const { data: windowData } = await supabaseClient
            .from("active_windows")
            .select("*")
            .eq("window_name", savedWindow)
            .single();

        if (!windowData) {
            localStorage.removeItem("activeWindow");
            return;
        }

        // If another tab was using it, maybe alert user or allow takeover
        if (windowData.current_tab_id !== tabId) {
            console.log("Another tab might be using this window, but resuming anyway...");
        }

        selectedWindow = savedWindow;

        // ✅ HIDE selection UI immediately
        windowSelectSection.classList.add("d-none");
        faqGrid?.classList.add("d-none");
        editorSection?.classList.add("d-none");

        // ✅ SHOW queue UI
        showQueueUI(selectedWindow);

        // Update DB with current tab
        await supabaseClient
            .from("active_windows")
            .update({ current_tab_id: tabId, is_active: true })
            .eq("window_name", selectedWindow);

    } catch (err) {
        console.error("Error restoring window:", err);
        localStorage.removeItem("activeWindow");
    }
});

//   window.addEventListener("load", async () => {
//   const savedWindow = localStorage.getItem("activeWindow");
//   if (!savedWindow) return;

//   try {
//     const { data: windowData } = await supabaseClient
//       .from("active_windows")
//       .select("*")
//       .eq("window_name", savedWindow)
//       .single();

//     if (!windowData) {
//       localStorage.removeItem("activeWindow");
//       return;
//     }

//     // If another tab was using it, maybe alert user or allow takeover
//     if (windowData.current_tab_id !== tabId) {
//       console.log("Another tab might be using this window, but resuming anyway...");
//     }

//     selectedWindow = savedWindow;
//     showQueueUI(selectedWindow);

//     // Update DB with current tab
//     await supabaseClient
//       .from("active_windows")
//       .update({ current_tab_id: tabId, is_active: true })
//       .eq("window_name", selectedWindow);

//   } catch (err) {
//     console.error("Error restoring window:", err);
//     localStorage.removeItem("activeWindow");
//   }
// });


async function updateActiveWindow() {
  if (selectedWindow) {
    await supabaseClient
      .from("active_windows")
      .update({ current_tab_id: tabId, is_active: true })
      .eq("window_name", selectedWindow);
  }
}


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


  logoutBtn?.addEventListener("click", async () => {
    console.log("Logout clicked ✅");
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else window.location.href = "/admin/login";
  });

  // Section Toggle 
   document.querySelectorAll(".card-button").forEach((button) => {
     button.addEventListener("click", () => {
       if (button.id === "proceed-button") return;

       const targetId = button.getAttribute("data-target");

       if (targetId) {
         // 1. Track the section we are going to
         lastSectionId = targetId; 
         // 2. Hide all main views
         faqGrid.classList.add("d-none");
         enrollmentSection.classList.add("d-none");
         documentRequestSection.classList.add("d-none");
         windowSelectSection.classList.add("d-none");
         queueDashboardHeader.classList.add("d-none");
         processingSection.classList.add("d-none");
         if (editorSection) editorSection.classList.add("d-none"); 
         // 3. Show the target section
         const targetEl = document.getElementById(targetId);
         if (targetEl) {
           targetEl.classList.remove("d-none");  
           // 4. SHOW THE BACK BUTTON (Specific to this section)
           const backContainer = targetEl.querySelector(".back-container");
           if (backContainer) {
             backContainer.classList.remove("d-none");
           }
         } 
         window.scrollTo({ top: 0, behavior: "smooth" });
       }
     });
   });

   // =======================
  // Back Button Logic
  // =======================
  document.querySelectorAll(".back-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const currentContainer = button.closest("div[id$='section']");

      // 1. Hide ALL sections first
      faqGrid.classList.add("d-none");
      enrollmentSection.classList.add("d-none");
      documentRequestSection.classList.add("d-none");
      if (editorSection) editorSection.classList.add("d-none");

      // 2. Hide ALL back-containers
      document.querySelectorAll(".back-container").forEach(container => {
          container.classList.add("d-none");
      });

      // 3. Determine Destination
      if (currentContainer && currentContainer.id === 'faq-editor-section') {
          const previousEl = document.getElementById(lastSectionId);
          if (previousEl) {
              previousEl.classList.remove("d-none");
              
              // Re-show the back button for that Table
              const backContainer = previousEl.querySelector(".back-container");
              if (backContainer) backContainer.classList.remove("d-none");
          } else {
             // Fallback
             faqGrid.classList.remove("d-none");
          }
      } else {
          // CASE B: In Table -> Go back to Grid
          faqGrid.classList.remove("d-none");
          // Reset tracker
          lastSectionId = 'faq-grid'; 
      }
    });
  });



// Optional: Unlock stale windows on page load (older than 15s)
async function cleanupStaleWindows() {
  const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();
  await supabaseClient
    .from("active_windows")
    .update({ is_active: false, current_tab_id: null })
    .lt("last_heartbeat", fifteenSecondsAgo);
}

// Call cleanup on page load
cleanupStaleWindows();


// Unlock the current window
function unlockWindow() {
  if (!selectedWindow) return;

  const url = `${window.location.origin}/api/unlock-window`;
  const payload = JSON.stringify({
    window_name: selectedWindow,
    current_tab_id: tabId
  });

  navigator.sendBeacon(url, payload);
}


// Unlock on logout
logoutBtn.addEventListener("click", async () => {
  await unlockWindow();
  window.location.href = "/admin/login";
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

  // Confirmation modal
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

  // Hide FAQ and other UI
  faqGrid.classList.add("d-none");
  editorSection?.classList.add("d-none");
  documentRequestSection.classList.add("d-none");

  // Show queue sections
  windowSelectSection.classList.add("d-none");
  queueDashboardHeader.classList.remove("d-none");
  enrollmentSection.classList.remove("d-none");
  processingSection.classList.remove("d-none");
  document.getElementById("back-to-window-select").classList.remove("d-none");

  if (windowNumberText) windowNumberText.textContent = selectedWindow;
  localStorage.setItem("activeWindow", selectedWindow);

  // Load data
  loadQueueData();
  loadProcessingData();
});

// ==========================
// HANDLE WINDOW BUTTON CLICK
// ==========================
windowButtons.forEach((btn, index) => {
  btn.addEventListener("click", async () => {
    const windowName = `Window ${index + 1}`;

    try {
      const { data, error } = await supabaseClient
    .from("active_windows")
    .update({
      is_active: true,
      current_tab_id: tabId,
      last_heartbeat: new Date().toISOString()
    })
    .eq("window_name", windowName)
    .is("current_tab_id", null) // <-- use .is() instead of .eq()
    .select();


      if (error || !data || data.length === 0) {
        return alert(`${windowName} is already in use by another tab!`);
      }

      // Unlock previously selected window
      if (selectedWindow && selectedWindow !== windowName) {
        await unlockWindow(selectedWindow);
      }

      selectedWindow = windowName;
      localStorage.setItem("activeWindow", selectedWindow);

      // Update UI
      windowButtons.forEach(b => b.classList.remove("active-window"));
      btn.classList.add("active-window");
      updateStatusPills(selectedWindow);

      console.log("Selected and locked:", selectedWindow);

    } catch (err) {
      console.error("Error locking window:", err);
    }
  });
});

// ==========================
// UPDATE STATUS PILLS UI
// ==========================
function updateStatusPills(activeWindow) {
  windowStatusPills.forEach((pill, idx) => {
    const light = pill.querySelector(".status-light");
    const pillWindow = `Window ${idx + 1}`;
    if (activeWindow?.toLowerCase() === pillWindow.toLowerCase()) {
      light.classList.remove("offline");
      light.classList.add("online");
      pill.classList.add("active-status");
    } else {
      light.classList.remove("online");
      light.classList.add("offline");
      pill.classList.remove("active-status");
    }
  });
}

// ==========================
// HEARTBEAT (KEEP WINDOW ALIVE)
// ==========================
setInterval(async () => {
  if (!selectedWindow) return;

  try {
    await supabaseClient
      .from("active_windows")
      .update({ last_heartbeat: new Date().toISOString() })
      .eq("window_name", selectedWindow)
      .eq("current_tab_id", tabId);
  } catch (err) {
    console.error("Heartbeat failed:", err);
  }
}, 5000); // every 5 seconds

// ==========================
// UNLOCK WINDOW FUNCTION
// ==========================
async function unlockWindow(windowName = selectedWindow) {
  if (!windowName) return;

  try {
    await supabaseClient
      .from("active_windows")
      .update({ is_active: false, current_tab_id: null })
      .eq("window_name", windowName)
      .eq("current_tab_id", tabId);
  } catch (err) {
    console.error("Failed to unlock window:", err);
  }
}

// ==========================
// AUTO-UNLOCK ON TAB CLOSE/REFRESH
// ==========================
window.addEventListener("beforeunload", () => {
  if (!selectedWindow) return;

  const payload = JSON.stringify({ windowName: selectedWindow, tabId });
  const blob = new Blob([payload], { type: 'application/json' });

  navigator.sendBeacon("/api/unlock-window", blob);
});


// ==========================
// SHOW QUEUE SECTION AFTER PROCEED
// ==========================
function showQueueUI(windowName) {
  windowSelectSection.classList.add("d-none");
  queueDashboardHeader.classList.remove("d-none");
  enrollmentSection.classList.remove("d-none");
  processingSection.classList.remove("d-none");
  document.getElementById("back-to-window-select").classList.remove("d-none");

  if (windowNumberText) windowNumberText.textContent = windowName;

  updateStatusPills(windowName);

  loadQueueData();
  loadProcessingData();
}


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

  logoutPopupConfirmBtn.addEventListener("click", async () => {
    if (selectedWindow) {
        try {
            await unlockWindow(); // wait for DB to unlock
        } catch (err) {
            console.error("Failed to unlock window:", err);
        }
    }

    // Clear tables
    const tables = [
        enrollmentTableBody,
        document.querySelector("#processing-section tbody"),
        document.querySelector("#finished-section tbody"),
        kioskTableBody
    ];

    tables.forEach(tbody => {
        if (tbody) tbody.innerHTML = "";
    });

    localStorage.removeItem("activeWindow");
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
  style.innerHTML = `...`; 
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

  // Move to Processing handler
  function attachQueueActionHandlers() {
  document.querySelectorAll(".move-card-button").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const queueNo = btn.dataset.queueNo;

      const { data: processingData, error } = await supabaseClient
        .from("queue")
        .select("*")
        .eq("status", "processing")
        .eq("window_name", selectedWindow);

      if (error) {
        console.error(error);
        return alert("⚠️ Failed to check processing queue!");
      }

      if (processingData.length > 0) {
        return alert(`⚠️ ${selectedWindow} already has a processing item. Complete it first!`);
      }

      processingPopup.dataset.currentId = id;
      processingPopupName.textContent = `#${queueNo} (${name})`;

      processingPopup.classList.add("is-visible");
      backdrop.classList.add("is-visible");
    });
  });
}


  // Finish button handler
  function attachProcessingHandlers() {
    document.querySelectorAll(".finish-card-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const queueNo = btn.dataset.queueNo;

        confirmPopup.dataset.currentId = id;
        confirmPopupName.textContent = `#${queueNo} (${name})`;

        confirmPopup.classList.add("is-visible");
        backdrop.classList.add("is-visible");
      });
    });
  }

  // Handlers for Processing Popup ---
  processingPopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    processingPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete processingPopup.dataset.currentId;
  });

  processingPopupConfirmBtn.addEventListener("click", async () => {
    const id = processingPopup.dataset.currentId;
    if (!id) return;

    const { error } = await supabaseClient
    .from("queue")
    .update({ 
      status: "processing",
      window_name: selectedWindow
    })
    .eq("id", id)
    .eq('status', 'queue');


    if (error) return alert("❌ Failed to move to processing!");

    processingPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete processingPopup.dataset.currentId;

    await loadQueueData();
    await loadProcessingData();
  });

  // Handlers for Confirm Finish Popup ---
  confirmPopupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    confirmPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete confirmPopup.dataset.currentId;
  });

  confirmPopupConfirmBtn.addEventListener("click", async () => {
    const id = confirmPopup.dataset.currentId;
    if (!id) return;

    const { error } = await supabaseClient
      .from("queue")
      .update({ status: "finished" })
      .eq("id", id);

    if (error) return alert("❌ Failed to mark as finished!");

    confirmPopup.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    delete confirmPopup.dataset.currentId;

    await loadProcessingData();
  });


  async function loadFinishedData() {
  const finishedTbody = document.querySelector("#finished-section tbody");
  if (!finishedTbody) return;

  const { data, error } = await supabaseClient
    .from("queue")
    .select("*")
    .eq("status", "finished")
    .order("queue_no", { ascending: true });

  if (error) {
    console.error("Error loading finished logs:", error);
    return;
  }

  finishedTbody.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");

    let actionContent = `<button class="btn btn-sm btn-danger delete-queue-button" data-id="${row.id}" data-name="${row.full_name}">X</button>`;

    tr.innerHTML = `
      <td>${row.queue_no}</td>
      <td>${row.full_name}</td>
      <td>${new Date(row.created_at).toLocaleString()}</td>
      <td>${actionContent}</td>
    `;

    finishedTbody.appendChild(tr);
  });

  attachQueueDeleteHandlers();
}


  const finishedLogsBtn = document.getElementById("finished-logs-btn");
  finishedLogsBtn?.addEventListener("click", async () => {
    await loadFinishedData();
  });

  // REPLACED: Delete handler 
  function attachQueueDeleteHandlers() {
    document.querySelectorAll(".delete-queue-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        deletePopup.dataset.currentId = id;
        
        deletePopupName.textContent = name;

        deletePopup.classList.add("is-visible");
        backdrop.classList.add("is-visible");
      });
    });
  }

  // Handlers for Delete Popup ---
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

  backdrop.addEventListener("click", () => {
    // This will close ANY open modal
    deletePopup.classList.remove("is-visible");
    logoutPopup.classList.remove("is-visible");
    processingPopup.classList.remove("is-visible");
    confirmPopup.classList.remove("is-visible");
  });


    // Show FAQ Editor 
    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 1. Track where we came from (The Table Section)
        const parentSection = btn.closest("div[id$='section']");
        if (parentSection) {
          lastSectionId = parentSection.id;
          parentSection.classList.add("d-none"); // Hide the table
        }

        // 2. Show Editor
        editorSection?.classList.remove("d-none");

        // 3. Hide others (Safety)
        faqGrid?.classList.add("d-none");
        enrollmentSection?.classList.add("d-none");
        documentRequestSection?.classList.add("d-none");

        // 4. SHOW EDITOR BACK BUTTON
        const editorBackContainer = editorSection?.querySelector(".back-container");
        if (editorBackContainer) {
          editorBackContainer.classList.remove("d-none");
        }

        window.scrollTo({ top: editorSection?.offsetTop || 0, behavior: "smooth" });
      });
    });

    // Add Requirement
    const addRequirementIcon = requirementInput?.nextElementSibling;
    addRequirementIcon?.addEventListener("click", () => {
      const value = requirementInput.value.trim();
      if (!value) return;
      requirements.push(value);
      requirementInput.value = "";
      renderRequirements();
    });

    // Add Step
    const addStepIcon = stepProcessInput?.nextElementSibling;
    addStepIcon?.addEventListener("click", () => {
      const value = stepProcessInput.value.trim();
      if (!value) return;
      steps.push(value);
      stepProcessInput.value = "";
      renderSteps();
    });

    // Image Preview
    imageInput?.addEventListener("change", () => {
      const file = imageInput.files[0];
      const previewImage = editorSection?.querySelector(".preview-image");

      if (file && previewImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else if (previewImage) {
        previewImage.src = "";
        previewImage.style.display = "none";
      }
    });

    // Submit → Save to Supabase
    const submitBtn = editorSection?.querySelector("button.btn-primary");
    submitBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const questionTitle = questionTitleInput.value.trim();
      const file = imageInput.files[0];
      const editingId = editorSection.dataset.editingId || null;

      if (!questionTitle || requirements.length === 0 || steps.length === 0) {
        alert("⚠️ Please fill all fields and add at least one requirement and process.");
        return;
      }

      let imageUrl = null;
      if (file) {
        const filePath = `kiosk-images/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseClient.storage.from("kiosk").upload(filePath, file, { upsert: true });
        if (uploadError) { console.error(uploadError); alert("❌ Image upload failed!"); return; }
        const { data: publicUrlData } = supabaseClient.storage.from("kiosk").getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      if (editingId) {
        const { error } = await supabaseClient.from("kiosk").update({
          question_title: questionTitle,
          requirements: JSON.stringify(requirements),
          steps: JSON.stringify(steps),
          ...(imageUrl ? { image_url: imageUrl } : {}),
        }).eq("id", editingId);
        if (error) alert("❌ Failed to update record!");
        else {
          alert("✅ Record updated successfully!");
          delete editorSection.dataset.editingId;
          submitBtn.textContent = "Add Record";
        }
      } else {
        const { error } = await supabaseClient.from("kiosk").insert([{
          question_title: questionTitle,
          requirements: JSON.stringify(requirements),
          steps: JSON.stringify(steps),
          image_url: imageUrl,
        }]);
        if (error) alert("❌ Failed to add record!");
        else alert("✅ Record added successfully!");
      }

      // Reset form
      questionTitleInput.value = "";
      requirementInput.value = "";
      stepProcessInput.value = "";
      imageInput.value = "";
      requirements = [];
      steps = [];
      renderRequirements();
      renderSteps();

      // Clear image preview
      const previewImage = editorSection?.querySelector(".preview-image");
      if (previewImage) {
        previewImage.src = "";
        previewImage.style.display = "none";
      }


      editorSection?.classList.add("d-none");
      documentRequestSection?.classList.remove("d-none");
      loadKioskData();
    });

    // Functions: Render Requirements & Steps
    function renderRequirements() {
      const container = requirementContainer.parentElement.parentElement;
      container.querySelector(".requirements-list")?.remove();

      if (requirements.length === 0) {
        requirementContainer.innerHTML = "<span>Added Requirement</span>";
      } else {
        requirementContainer.innerHTML = `<span>${requirements[0]}</span>`;
        let firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
        firstMinus.className = "ph-minus ph-minos";
        firstMinus.style.cursor = "pointer";
        firstMinus.onclick = () => { requirements.shift(); renderRequirements(); };
        if (!container.contains(firstMinus)) container.querySelector(".fill-upper")?.appendChild(firstMinus);
      }

      if (requirements.length > 1) {
        const listDiv = document.createElement("div");
        listDiv.className = "requirements-list mt-2";
        requirements.slice(1).forEach((req, index) => {
          const block = document.createElement("div");
          block.className = "fill mb-2 d-flex justify-content-between align-items-center";
          const textDiv = document.createElement("div");
          textDiv.className = "fill-upper";
          const span = document.createElement("span");
          span.textContent = req;
          textDiv.appendChild(span);
          const minusIcon = document.createElement("i");
          minusIcon.className = "ph-minus ph-minos";
          minusIcon.style.cursor = "pointer";
          minusIcon.onclick = () => { requirements.splice(index + 1, 1); renderRequirements(); };
          block.appendChild(textDiv);
          block.appendChild(minusIcon);
          listDiv.appendChild(block);
        });
        container.appendChild(listDiv);
      }

      // Update Preview
      if (requirementsPreview) {
        requirementsPreview.innerHTML = "";
        requirements.forEach(req => {
          const li = document.createElement("li");
          li.textContent = req;
          requirementsPreview.appendChild(li);
        });
      }
    }

    function renderSteps() {
      const container = processContainer.parentElement.parentElement;
      container.querySelector(".steps-list")?.remove();

      if (steps.length === 0) {
        processContainer.innerHTML = "<span>Added Process</span>";
        if (stepsPreviewContainer) stepsPreviewContainer.innerHTML = "";
        return;
      }

      processContainer.innerHTML = `<span>${steps[0]}</span>`;
      let firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
      firstMinus.className = "ph-minus ph-minos";
      firstMinus.style.cursor = "pointer";
      firstMinus.onclick = () => { steps.shift(); renderSteps(); };
      if (!container.contains(firstMinus)) container.querySelector(".fill-upper")?.appendChild(firstMinus);

      if (steps.length > 1) {
        const listDiv = document.createElement("div");
        listDiv.className = "steps-list mt-2";
        steps.slice(1).forEach((step, index) => {
          const block = document.createElement("div");
          block.className = "fill mb-2 d-flex justify-content-between align-items-center";
          const textDiv = document.createElement("div");
          textDiv.className = "fill-upper";
          const span = document.createElement("span");
          span.textContent = step;
          textDiv.appendChild(span);
          const minusIcon = document.createElement("i");
          minusIcon.className = "ph-minus ph-minos";
          minusIcon.style.cursor = "pointer";
          minusIcon.onclick = () => { steps.splice(index + 1, 1); renderSteps(); };
          block.appendChild(textDiv);
          block.appendChild(minusIcon);
          listDiv.appendChild(block);
        });
        container.appendChild(listDiv);
      }

      if (stepsPreviewContainer) {
        stepsPreviewContainer.innerHTML = "";
        const ol = document.createElement("ol");
        ol.style.paddingLeft = "20px";
        steps.forEach((step, i) => {
          const li = document.createElement("li");
          li.style.display = "flex";
          li.style.alignItems = "center";
          li.style.gap = "8px";
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `step-${i}`;
          const label = document.createElement("label");
          label.setAttribute("for", `step-${i}`);
          label.textContent = step;
          li.appendChild(checkbox);
          li.appendChild(label);
          ol.appendChild(li);
        });
        stepsPreviewContainer.appendChild(ol);
      }
    }


    // Load Kiosk Data
    async function loadKioskData() {
      const { data, error } = await supabaseClient.from("kiosk").select("*").order("created_at", { ascending: false });
      if (error) { console.error(error); return; }
      if (!kioskTableBody) return;

      kioskTableBody.innerHTML = "";
      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${row.question_title}</td>
          <td>${row.requirements ? JSON.parse(row.requirements).map((r,i)=>`${i+1}. ${r}`).join("<br>") : ""}</td>
          <td>${row.steps ? JSON.parse(row.steps).map((s,i)=>`${i+1}. ${s}`).join("<br>") : ""}</td>
          <td>${row.image_url ? `<img src="${row.image_url}" alt="Image" style="width:60px;height:auto;border-radius:4px;">` : ""}</td>
          <td>${new Date(row.created_at).toLocaleDateString()}</td>
          <td>
            <a href="#" class="text-primary me-2 edit-kiosk" data-id="${row.id}"><i class="ph ph-pencil-simple"></i></a>
            <a href="#" class="text-danger delete-kiosk" data-id="${row.id}"><i class="ph ph-trash"></i></a>
          </td>
        `;
        kioskTableBody.appendChild(tr);
      });

      attachKioskEditDeleteHandlers();
    }

    // Edit/Delete Handlers
    function attachKioskEditDeleteHandlers() {
      document.querySelectorAll(".edit-kiosk").forEach(link => {
        link.addEventListener("click", async e => {
          e.preventDefault();
          const id = link.dataset.id;
          const { data, error } = await supabaseClient.from("kiosk").select("*").eq("id", id).single();
          if (error) { alert("❌ Failed to load data."); return; }
          questionTitleInput.value = data.question_title;
          requirements = JSON.parse(data.requirements || "[]");
          steps = JSON.parse(data.steps || "[]");
          renderRequirements();
          renderSteps();
          const previewImage = editorSection.querySelector(".preview-image");
          if (data.image_url && previewImage) {
            previewImage.src = data.image_url;
            previewImage.style.display = "block";
          } else if (previewImage) {
            previewImage.src = "";
            previewImage.style.display = "none";
  }
          editorSection?.classList.remove("d-none");
          faqGrid?.classList.add("d-none");
          documentRequestSection?.classList.add("d-none");
          editorSection.dataset.editingId = id;
          submitBtn.textContent = "Update Record";
        });
      });

      document.querySelectorAll(".delete-kiosk").forEach(btn => {
        btn.addEventListener("click", async e => {
          e.preventDefault();
          const id = btn.dataset.id;
          if (!confirm("Are you sure you want to delete this record?")) return;
          const { error } = await supabaseClient.from("kiosk").delete().eq("id", id);
          if (error) { alert("❌ Failed to delete record!"); }
          else { alert("✅ Record deleted successfully!"); loadKioskData(); }
        });
      });
    }



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