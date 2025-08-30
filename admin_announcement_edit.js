// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";  
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// Real-time Preview Handlers
// =======================
function setupPreview() {
  const titleInput = document.getElementById("announcementTitle");
  const detailsInput = document.getElementById("announcementDetails");
  const dateInput = document.getElementById("scheduledDateTime");
  const imageInput = document.getElementById("imageInput");
  const previewImage = document.getElementById("previewImage");
  const uploadArea = document.getElementById("uploadArea");

  titleInput.addEventListener("input", () => {
    document.getElementById("previewTitle").textContent = titleInput.value || "ANNOUNCEMENT TITLE";
  });

  detailsInput.addEventListener("input", () => {
    document.getElementById("previewContent").textContent = detailsInput.value || "Your announcement details will appear here...";
  });

  dateInput.addEventListener("input", () => {
    if (dateInput.value) {
      const dateObj = new Date(dateInput.value);
      const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
      const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      document.getElementById("previewDateTime").innerHTML = `<strong>${formattedDate}</strong> • <span class="text-muted">${formattedTime}</span>`;
    } else {
      document.getElementById("previewDateTime").innerHTML = `<strong>MM/DD/YY</strong> • <span class="text-muted">--:--</span>`;
    }
  });

  // Handle drag & drop / click upload
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => previewImage.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  uploadArea.addEventListener("dragover", e => e.preventDefault());
  uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      imageInput.files = e.dataTransfer.files;
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = ev => previewImage.src = ev.target.result;
      reader.readAsDataURL(file);
    }
  });
}

// =======================
// Load existing announcement if editing
// =======================
async function loadAnnouncement(editId) {
  if (!editId) return;

  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .eq("id", editId)
    .single();

  if (error) {
    console.error("Error loading announcement:", error.message);
    return;
  }

  // Populate form fields
  document.getElementById("announcementTitle").value = data.title || "";
  document.getElementById("announcementDetails").value = data.details || "";

  // Format datetime-local input properly
  if (data.scheduled_datetime) {
    const dt = new Date(data.scheduled_datetime);
    const localISO = dt.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    document.getElementById("scheduledDateTime").value = localISO;
  } else {
    document.getElementById("scheduledDateTime").value = "";
  }

  // Populate preview
  document.getElementById("previewTitle").textContent = data.title || "ANNOUNCEMENT TITLE";
  document.getElementById("previewContent").textContent = data.details || "Your announcement details will appear here...";
  document.getElementById("previewImage").src = data.image_url || "img/CARD-BG.png";

  // Update preview date/time
  if (data.scheduled_datetime) {
    const dateObj = new Date(data.scheduled_datetime);
    const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
    const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    document.getElementById("previewDateTime").innerHTML = `<strong>${formattedDate}</strong> • <span class="text-muted">${formattedTime}</span>`;
  } else {
    document.getElementById("previewDateTime").innerHTML = `<strong>MM/DD/YY</strong> • <span class="text-muted">--:--</span>`;
  }

  // Update button text
  document.querySelector(".btn2-text").textContent = "Update Announcement";
}

// =======================
// Submit Button Handler
// =======================
document.querySelector(".add-announcement-btn").addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  const titleInput = document.getElementById("announcementTitle");
  const detailsInput = document.getElementById("announcementDetails");
  const dateInput = document.getElementById("scheduledDateTime");
  const imageInput = document.getElementById("imageInput");

  // Load existing values to allow partial updates
  let title = titleInput.value.trim();
  let details = detailsInput.value.trim();
  let dateTime = dateInput.value;
  let imageUrl = document.getElementById("previewImage").src;

  if (editId) {
    const { data: existing } = await supabaseClient
      .from("announcements")
      .select("*")
      .eq("id", editId)
      .single();

    title = title || existing.title;
    details = details || existing.details;
    dateTime = dateTime || existing.scheduled_datetime;
    imageUrl = imageInput.files.length > 0 ? imageUrl : existing.image_url;
  }

  // Only upload new image if a file is selected
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabaseClient.storage.from("announcements").upload(fileName, file);
    if (uploadError) return alert("Image upload failed: " + uploadError.message);
    const { data: publicUrlData } = supabaseClient.storage.from("announcements").getPublicUrl(fileName);
    imageUrl = publicUrlData.publicUrl;
  }

  const payload = { title, details, scheduled_datetime: dateTime, image_url: imageUrl };

  if (editId) {
    const { error } = await supabaseClient.from("announcements").update(payload).eq("id", editId);
    if (error) return alert("Update failed: " + error.message);
    alert("Announcement updated!");
  } else {
    const { error } = await supabaseClient.from("announcements").insert([payload]);
    if (error) return alert("Insert failed: " + error.message);
    alert("Announcement added!");
  }

  window.location.href = "admin_announcement.html";
});

// =======================
// Init
// =======================
document.addEventListener("DOMContentLoaded", () => {
  setupPreview();
  const urlParams = new URLSearchParams(window.location.search);
  loadAnnouncement(urlParams.get("id"));
});
