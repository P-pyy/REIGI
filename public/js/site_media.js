
    // Handle dynamic content swap
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('upload-btn')) {
        const targetFile = e.target.dataset.target;
        const mediaContainer = document.getElementById('media-container');

        try {
          const res = await fetch(targetFile);
          if (!res.ok) throw new Error('Failed to load ' + targetFile);
          mediaContainer.innerHTML = await res.text();
        } catch (err) {
          console.error(err);
          mediaContainer.innerHTML = `<p class="text-danger">Failed to load content. Check console.</p>`;
        }
      }
    });


    //Content swap with changes in header
    document.addEventListener('DOMContentLoaded', () => {
      const uploadButtons = document.querySelectorAll('.upload-btn');
      uploadButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetPage = button.getAttribute('data-target');
          if (targetPage) {
            window.location.href = targetPage;
          }
        });
      });
    });

// =======================
// Supabase Config
// =======================
import { supabaseClient } from '/js/supabase-client.js';

// =======================
// Helper: Format date to Philippine Time
// =======================
function formatPHDate(utcDateString) {
  const dateObj = new Date(utcDateString);
  return dateObj.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}



// =======================
// Check Admin Login
// =======================
let currentUser = null; // ✅ define this globally

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    alert("You must be logged in to upload media.");
    window.location.href = "/admin/login";
    return;
  }

  currentUser = session.user; // ✅ assign the logged-in user here
})();

// Toggle
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

});


// =======================
// Upload Logic (Video + Calendar)
// =======================
let selectedFile = null;

// Calendar Sections (Undergraduate & Graduate)
document.querySelectorAll(".calendar-section").forEach(section => {
  const fileInput = section.querySelector("input[type=file]");
  const previewBox = section.querySelector(".preview-box");
  const submitBtn = section.querySelector(".submit-btn");

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;

    if (file.type.startsWith("image")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = "100%";
      img.style.borderRadius = "12px";
      previewBox.innerHTML = "";
      previewBox.appendChild(img);
    }
  });

  submitBtn?.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please choose a file first!");
    if (!currentUser) return alert("User not logged in.");

    let type, folder, title;
    const selected = document.getElementById("selected")?.textContent.trim();

    if (selected === "Graduate") {
      type = "calendar_grad";
      folder = "calendar_grad";
      title = "Graduate Academic Calendar";
    } else {
      type = "calendar";
      folder = "calendar";
      title = "Undergraduate Academic Calendar";
    }

    await uploadToSupabase(selectedFile, folder, type, title);
  });
});

// Video Section (site_media_video.html)
const editorPage = document.querySelector('.site-media-editor-page');

if (editorPage) {
  const fileInput = editorPage.querySelector("input[type=file]");
  const previewBox = editorPage.querySelector(".image-box");
  const submitBtn = editorPage.querySelector(".submit-btn");

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;

    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = URL.createObjectURL(file);
      video.style.maxWidth = "100%";
      video.style.borderRadius = "12px";
      previewBox.innerHTML = "";
      previewBox.appendChild(video);
    }
  });

  submitBtn?.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please choose a file first!");
    if (!currentUser) return alert("User not logged in.");

    const type = "video";
    const folder = "videos";
    const title = "Homepage FAQ Video";

    await uploadToSupabase(selectedFile, folder, type, title);
  });
}

// =======================
// Upload Helper with PH time
// =======================
async function uploadToSupabase(file, folder, type, title) {
  const filePath = `${folder}/${Date.now()}_${file.name}`;

  // Upload to storage
  const { error: uploadError } = await supabaseClient.storage
    .from("sitemedia")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Storage upload error:", uploadError.message);
    return alert("Upload failed: " + uploadError.message);
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage.from("sitemedia").getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  // =======================
  // Get current PH time correctly
  // =======================
  const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const uploadedAt = new Date(phTime).toISOString(); // ISO string for Supabase


  // Insert record into DB with uploaded_at in PH time
  const { error: dbError } = await supabaseClient.from("sitemedia").insert([{
    title,
    filename: file.name,
    file_url: fileUrl,
    type,
    user_id: currentUser.id,
    uploaded_at: phTime
  }]);

  if (dbError) {
    console.error("Database insert error:", dbError.message);
    return alert("Database save failed: " + dbError.message);
  }

  alert(`${title} uploaded successfully!`);

  // Redirect to sitemedia.html after upload
  window.location.href = "/admin/site_media";
}

// async function uploadToSupabase(file, folder, type, title) {
//   const filePath = `${folder}/${Date.now()}_${file.name}`;

//   // Upload to storage
//   const { error: uploadError } = await supabaseClient.storage
//     .from("sitemedia")
//     .upload(filePath, file, { upsert: true });

//   if (uploadError) {
//     console.error("Storage upload error:", uploadError.message);
//     return alert("Upload failed: " + uploadError.message);
//   }

//   // Get public URL
//   const { data: urlData } = supabaseClient.storage.from("sitemedia").getPublicUrl(filePath);
//   const fileUrl = urlData.publicUrl;

//   // Insert record into DB
//   const { error: dbError } = await supabaseClient.from("sitemedia").insert([{
//     title,
//     filename: file.name,
//     file_url: fileUrl,
//     type,
//     user_id: currentUser.id,
//   }]);

//   if (dbError) {
//     console.error("Database insert error:", dbError.message);
//     return alert("Database save failed: " + dbError.message);
//   }

//   alert(`${title} uploaded successfully!`);

//   // Redirect to sitemedia.html after upload
// window.location.href = "/admin/site_media";
// }

// =======================
// Load Latest Media
// =======================
window.addEventListener("DOMContentLoaded", async () => {
  // =======================
  // Load FAQ Video
  // =======================
  const { data: videoData, error: videoError } = await supabaseClient
    .from("sitemedia")
    .select("*")
    .eq("type", "video")
    .order("id", { ascending: false })
    .limit(1);

  if (!videoError && videoData?.length > 0) {
    const videoBox = document.querySelector(".image-box");
    const fileNameEl = document.querySelector(".file-name");
    if (videoBox) {
      videoBox.innerHTML = `
        <video controls style="max-width:100%; border-radius:12px;">
          <source src="${videoData[0].file_url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    }
    if (fileNameEl) fileNameEl.textContent = videoData[0].filename;
  }

// =======================
// Load Latest Calendars (Undergrad + Grad)
// =======================
const { data: calendars, error: calError } = await supabaseClient
  .from("sitemedia")
  .select("*")
  .in("type", ["calendar", "calendar_grad"])
  .order("id", { ascending: false });

if (!calError && calendars?.length > 0) {
  // Separate undergrad and grad
  const undergrad = calendars.find(c => c.type === "calendar");
  const grad = calendars.find(c => c.type === "calendar_grad");

  // Always populate both preview boxes
  if (undergrad) {
    const preview = document.querySelector("#undergraduate-section .preview-box");
    if (preview) {
      preview.innerHTML = `<img src="${undergrad.file_url}" alt="Undergraduate Academic Calendar" style="max-width:100%; border-radius:12px;" />`;
    }
  }

  if (grad) {
    const gradPreview = document.querySelector("#graduate-section .preview-box");
    if (gradPreview) {
      gradPreview.innerHTML = `<img src="${grad.file_url}" alt="Graduate Academic Calendar" style="max-width:100%; border-radius:12px;" />`;
    }
  }

  // Update the Academic Calendar card on sitemedia.html
  const latest = calendars[0]; // most recent
  const card = document.querySelector(".right-card .image-box");
  const fileNameEl = document.querySelector(".right-card .file-name");
  if (card) {
    card.innerHTML = `<img src="${latest.file_url}" alt="Academic Calendar" style="max-width:100%; border-radius:12px;" />`;
    if (fileNameEl) fileNameEl.textContent = latest.filename;
  }
  
  // Auto-show the latest one in dropdown
  const selected = document.getElementById("selected");
  if (selected) {
    if (latest.type === "calendar_grad") {
      selected.textContent = "Graduate";
      document.getElementById("graduate-section").classList.add("active");
      document.getElementById("undergraduate-section").classList.remove("active");
    } else {
      selected.textContent = "Undergraduate";
      document.getElementById("undergraduate-section").classList.add("active");
      document.getElementById("graduate-section").classList.remove("active");
    }
  }
}
});

// =======================
// Dropdown Menu Logic
// =======================
(function () {
  const dropdown = document.getElementById("dropdown");
  if (!dropdown) return; // <-- prevent error if not on this page

  const dropdownContent = document.getElementById("dropdown-content");
  const selected = document.getElementById("selected");
  const options = dropdownContent.querySelectorAll('div[role="option"]');

  dropdown.addEventListener("click", () => dropdown.classList.toggle("open"));

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      const value = e.target.getAttribute("data-value");
      selected.textContent = value;
      dropdown.classList.remove("open");

      // Toggle sections
      document.getElementById("undergraduate-section").classList.remove("active");
      document.getElementById("graduate-section").classList.remove("active");

      if (value === "Graduate") {
        document.getElementById("graduate-section").classList.add("active");
      } else {
        document.getElementById("undergraduate-section").classList.add("active");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
  });
})();


