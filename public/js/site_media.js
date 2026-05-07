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


import { supabaseClient } from '/js/supabase-client.js';

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

let currentUser = null; 

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    alert("You must be logged in to upload media.");
    window.location.href = "/admin/login";
    return;
  }

  currentUser = session.user;
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

  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      console.log("Logout clicked ");
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Logout error:", error.message);
      else window.location.href = "/admin/login";
    });
  }

});

let selectedFile = null;

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

const editorPage = document.querySelector('.site-media-editor-page');

if (editorPage) {
  const fileInput = editorPage.querySelector("input[type=file]");
  const previewBox = editorPage.querySelector(".image-box");
  const uploadBox = editorPage.querySelector(".upload-box");
  const submitBtn = editorPage.querySelector(".submit-btn");

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;
    showVideoPreview(file);
  });

  if (uploadBox) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadBox.addEventListener(eventName, (e) => e.preventDefault(), false);
      uploadBox.addEventListener(eventName, (e) => e.stopPropagation(), false);
    });

    uploadBox.addEventListener("dragover", () => uploadBox.classList.add("dragover"));
    uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));
    uploadBox.addEventListener("drop", (e) => {
      uploadBox.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (!file) return;

      selectedFile = file;
      showVideoPreview(file);
    });
  }

  submitBtn?.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please choose or drop a file first!");
    if (!currentUser) return alert("User not logged in.");

    const type = "video";
    const folder = "videos";
    const title = "Homepage FAQ Video";

    await uploadToSupabase(selectedFile, folder, type, title);
  });

  function showVideoPreview(file) {
    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = URL.createObjectURL(file);
      video.style.maxWidth = "100%";
      video.style.borderRadius = "12px";
      previewBox.innerHTML = "";
      previewBox.appendChild(video);
    } else {
      alert("Please upload a valid video file (MP4 or WebM).");
    }
  }
}

async function uploadToSupabase(file, folder, type, title) {
  const filePath = `${folder}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("sitemedia")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Storage upload error:", uploadError.message);
    return alert("Upload failed: " + uploadError.message);
  }

  const { data: urlData } = supabaseClient.storage.from("sitemedia").getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;
  const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const uploadedAt = new Date(phTime).toISOString(); 

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

  window.location.href = "/admin/site_media";
}

window.addEventListener("DOMContentLoaded", async () => {

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

const { data: calendars, error: calError } = await supabaseClient
  .from("sitemedia")
  .select("*")
  .in("type", ["calendar", "calendar_grad"])
  .order("id", { ascending: false });

if (!calError && calendars?.length > 0) {
  const undergrad = calendars.find(c => c.type === "calendar");
  const grad = calendars.find(c => c.type === "calendar_grad");

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

  const latest = calendars[0]; 
  const card = document.querySelector(".right-card .image-box");
  const fileNameEl = document.querySelector(".right-card .file-name");
  if (card) {
    card.innerHTML = `<img src="${latest.file_url}" alt="Academic Calendar" style="max-width:100%; border-radius:12px;" />`;
    if (fileNameEl) fileNameEl.textContent = latest.filename;
  }
  
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

(function () {
  const dropdown = document.getElementById("dropdown");
  if (!dropdown) return; 

  const dropdownContent = document.getElementById("dropdown-content");
  const selected = document.getElementById("selected");
  const options = dropdownContent.querySelectorAll('div[role="option"]');

  dropdown.addEventListener("click", () => dropdown.classList.toggle("open"));

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      const value = e.target.getAttribute("data-value");
      selected.textContent = value;
      dropdown.classList.remove("open");

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


