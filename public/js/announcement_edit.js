// Supabase
import { supabase } from "./supabaseClient.js";

// Ensure User Logged In
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) window.location.href = "login.html";
})();

//HEADER JS
document.getElementById("page-title").textContent = "Announcements Edit";

// Real-time Preview
function setupPreview() {
  const titleInput = document.getElementById("announcementTitle");
  const detailsInput = document.getElementById("announcementDetails");
  const dateInput = document.getElementById("scheduledDateTime");
  const imageInput = document.getElementById("imageInput");
  const previewTitle = document.getElementById("previewTitle");
  const previewContent = document.getElementById("previewContent");
  const previewDateTime = document.getElementById("previewDateTime");
  const previewImage = document.getElementById("previewImage");
  const uploadArea = document.getElementById("uploadArea");

  if (!titleInput || !detailsInput || !dateInput || !imageInput) return;

  titleInput.addEventListener("input", () => {
    previewTitle.textContent = titleInput.value || "ANNOUNCEMENT TITLE";
  });

  detailsInput.addEventListener("input", () => {
    previewContent.textContent = detailsInput.value || "Your announcement details will appear here...";
  });

  dateInput.addEventListener("input", () => {
    if (dateInput.value) {
      const dt = new Date(dateInput.value);
      previewDateTime.innerHTML = `<strong>${dt.toLocaleDateString()}</strong> • <span class="text-muted">${dt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>`;
    } else {
      previewDateTime.innerHTML = `<strong>MM/DD/YY</strong> • <span class="text-muted">--:--</span>`;
    }
  });

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    previewImage.src = file ? URL.createObjectURL(file) : "img/CARD-BG.png";
  });

  if (uploadArea) {
    uploadArea.addEventListener("dragover", e => e.preventDefault());
    uploadArea.addEventListener("drop", e => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        imageInput.files = e.dataTransfer.files;
        previewImage.src = URL.createObjectURL(e.dataTransfer.files[0]);
      }
    });
  }
}

// Load Announcement (Edit)
async function loadAnnouncement(editId) {
  if (!editId) return;

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", editId)
    .single();

  if (error) {
    console.error("Load failed:", error.message);
    return alert("Failed to load announcement. Check console for details.");
  }

  document.getElementById("announcementTitle").value = data.title || "";
  document.getElementById("announcementDetails").value = data.details || "";
  document.getElementById("previewTitle").textContent = data.title || "ANNOUNCEMENT TITLE";
  document.getElementById("previewContent").textContent = data.details || "Your announcement details will appear here...";
  document.getElementById("previewImage").src = data.image_url || "img/CARD-BG.png";


  if (data.scheduled_datetime) {
    const dt = new Date(data.scheduled_datetime); // automatically converts to local time

    // Set input value for <input type="datetime-local">
    document.getElementById("scheduledDateTime").value = dt.toISOString().slice(0,16);

    // Set preview
    document.getElementById("previewDateTime").innerHTML = `
      <strong>${dt.toLocaleDateString("en-PH")}</strong> • 
      <span class="text-muted">${dt.toLocaleTimeString("en-PH", {hour:'2-digit',minute:'2-digit', hour12:true})}</span>
    `;
  } else {
    document.getElementById("previewDateTime").innerHTML = `<strong>MM/DD/YY</strong> • <span class="text-muted">--:--</span>`;
  }

  const btnText = document.querySelector(".btn2-text");
  if (btnText) btnText.textContent = "Update Announcement";

  const form = document.getElementById("announcementForm");
  if (form) form.dataset.editId = editId;
}

// Submit Handler
function setupSubmitHandler() {
  const form = document.getElementById("announcementForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const editId = form.dataset.editId || "";
    const title = document.getElementById("announcementTitle").value.trim();
    const details = document.getElementById("announcementDetails").value.trim();
    let dateTime = document.getElementById("scheduledDateTime").value;
    let imageUrl = document.getElementById("previewImage").src;
    const imageInput = document.getElementById("imageInput");

    // Convert input local time to UTC
    if (dateTime) {
      const localDt = new Date(dateTime);
      dateTime = localDt.toISOString(); // store as UTC
    }
    
    try {
      // Upload image if new file selected
      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("announcements").upload(fileName, file, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData, error: urlError } = supabase.storage.from("announcements").getPublicUrl(fileName);
        if (urlError) throw new Error(urlError.message);

        imageUrl = publicUrlData.publicUrl;
      }

      const payload = { title, details, scheduled_datetime: dateTime, image_url: imageUrl };

      if (editId !== "") {
        // Update existing announcement
        const { error } = await supabase.from("announcements").update(payload).eq("id", editId);
        if (error) throw new Error(error.message);
        alert("Announcement updated!");
      } else {
        // Insert new announcement
        const { error } = await supabase.from("announcements").insert([payload]);
        if (error) throw new Error(error.message);
        alert("Announcement added!");
      }

      window.location.href = "/admin/announcement";

    } catch (err) {
      console.error("Submit failed:", err.message);
      alert("Failed to submit announcement. Check console for details.");
    }
  });
}

// Init Function
export function initAnnouncementEdit(editId = null) {
  setupPreview();
  setupSubmitHandler();
  if (editId) loadAnnouncement(editId);
  else {
    const btnText = document.querySelector(".btn2-text");
    if (btnText) btnText.textContent = "Add Announcement";
  }
}

