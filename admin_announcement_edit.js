

// =======================
// Supabase Config
// =======================
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

// Title
document.getElementById("announcementTitle").addEventListener("input", function() {
  document.getElementById("previewTitle").textContent = this.value || "ANNOUNCEMENT TITLE";
});

// Date & Time (combined in one line)
document.getElementById("scheduledDateTime").addEventListener("input", function() {
  if (this.value) {
    const dateObj = new Date(this.value);

    const optionsDate = { year: "2-digit", month: "2-digit", day: "2-digit" };
    const formattedDate = dateObj.toLocaleDateString("en-US", optionsDate);

    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedTime = dateObj.toLocaleTimeString("en-US", optionsTime);

    document.getElementById("previewDateTime").innerHTML =
      `<strong>${formattedDate}</strong> • <span class="text-muted">${formattedTime}</span>`;
  } else {
    document.getElementById("previewDateTime").innerHTML =
      `<strong>MM/DD/YY</strong> • <span class="text-muted">--:--</span>`;
  }
});

// Details
document.getElementById("announcementDetails").addEventListener("input", function() {
  document.getElementById("previewContent").textContent = this.value || "Your announcement details will appear here...";
});

// Image Preview
document.getElementById("imageInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("previewImage").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// =======================
// Load existing announcement if editing
// =======================
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("id"); // now use ID from Supabase instead of index

if (editId) {
  (async () => {
    const { data, error } = await supabaseClient
      .from("announcements")
      .select("*")
      .eq("id", editId)
      .single();

    if (error) {
      console.error("Error loading announcement:", error.message);
      return;
    }

    // Populate form
    document.getElementById("announcementTitle").value = data.title;
    document.getElementById("announcementDetails").value = data.details;
    document.getElementById("scheduledDateTime").value = data.scheduled_datetime;

    // Populate preview
    document.getElementById("previewTitle").textContent = data.title;
    document.getElementById("previewContent").textContent = data.details;

    const dateObj = new Date(data.scheduled_datetime);
    const optionsDate = { year: "2-digit", month: "2-digit", day: "2-digit" };
    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };

    document.getElementById("previewDateTime").innerHTML =
      `<strong>${dateObj.toLocaleDateString("en-US", optionsDate)}</strong> • 
       <span class="text-muted">${dateObj.toLocaleTimeString("en-US", optionsTime)}</span>`;

    document.getElementById("previewImage").src = data.image_url;

    document.querySelector(".btn2-text").textContent = "Update Announcement";
  })();
}

// =======================
// Submit Button Handler
// =======================
document.querySelector(".add-announcement-btn").addEventListener("click", async function () {
  const title = document.getElementById("announcementTitle").value.trim();
  const details = document.getElementById("announcementDetails").value.trim();
  const dateTime = document.getElementById("scheduledDateTime").value;
  const imageInput = document.getElementById("imageInput");

  if (!title || !details || !dateTime) {
    alert("Please fill out all fields.");
    return;
  }

  let imageUrl = document.getElementById("previewImage").src;

  // If a new image was uploaded → upload to Supabase Storage
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("announcements") // 👈 create this bucket in Supabase
      .upload(fileName, file);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from("announcements")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  // Insert or Update into Supabase
  if (editId) {
    // Update existing
    const { error } = await supabaseClient
      .from("announcements")
      .update({
        title,
        details,
        scheduled_datetime: dateTime,
        image_url: imageUrl,
      })
      .eq("id", editId);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    alert("Announcement updated!");
  } else {
    // Insert new
    const { error } = await supabaseClient
      .from("announcements")
      .insert([
        {
          title,
          details,
          scheduled_datetime: dateTime,
          image_url: imageUrl,
        },
      ]);

    if (error) {
      alert("Insert failed: " + error.message);
      return;
    }
    alert("Announcement added!");
  }

  window.location.href = "admin_announcement.html";
});
