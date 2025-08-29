// Real-time Preview Handlers
  document.getElementById("announcementTitle").addEventListener("input", function() {
    document.getElementById("previewTitle").textContent = this.value || "ANNOUNCEMENT TITLE";
  });

  // Date & Time (combined in one line)
  document.getElementById("scheduledDateTime").addEventListener("input", function() {
    if (this.value) {
      const dateObj = new Date(this.value);

      // Format Date
      const optionsDate = { year: "2-digit", month: "2-digit", day: "2-digit" };
      const formattedDate = dateObj.toLocaleDateString("en-US", optionsDate);

      // Format Time
      const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
      const formattedTime = dateObj.toLocaleTimeString("en-US", optionsTime);

      // Update Preview in one line
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

  // Image
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

  // Check if editing (grab index from URL)
const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.get("index") !== null ? parseInt(urlParams.get("index"), 10) : null;

if (editIndex !== null) {
  let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
  const item = announcements[editIndex];

  if (item) {
    // Populate form fields
    document.getElementById("announcementTitle").value = item.title;
    document.getElementById("announcementDetails").value = item.details;
    document.getElementById("scheduledDateTime").value = item.dateTime;

    // Populate preview
    document.getElementById("previewTitle").textContent = item.title;
    document.getElementById("previewContent").textContent = item.details;

    const dateObj = new Date(item.dateTime);
    const optionsDate = { year: "2-digit", month: "2-digit", day: "2-digit" };
    const formattedDate = dateObj.toLocaleDateString("en-US", optionsDate);
    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedTime = dateObj.toLocaleTimeString("en-US", optionsTime);

    document.getElementById("previewDateTime").innerHTML =
      `<strong>${formattedDate}</strong> • <span class="text-muted">${formattedTime}</span>`;

    // Set preview image
    document.getElementById("previewImage").src = item.image;

    // Update button text
    document.querySelector(".btn2-text").textContent = "Update Announcement";
  }
}

// Submit Button
document.querySelector(".add-announcement-btn").addEventListener("click", function () {
  const title = document.getElementById("announcementTitle").value.trim();
  const details = document.getElementById("announcementDetails").value.trim();
  const dateTime = document.getElementById("scheduledDateTime").value;
  const imageInput = document.getElementById("imageInput");
  let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

  // Validation
  if (!title || !details || !dateTime || (editIndex === null && imageInput.files.length === 0)) {
    alert("Please fill out all fields and upload an image.");
    return;
  }

  function saveAndRedirect(imageData) {
    if (editIndex !== null) {
      // Update existing announcement
      announcements[editIndex] = { title, details, dateTime, image: imageData };
    } else {
      // Add new announcement
      announcements.unshift({ title, details, dateTime, image: imageData });
    }

    localStorage.setItem("announcements", JSON.stringify(announcements));
    window.location.href = "admin_announcement.html";
  }

  // If new image uploaded → use FileReader
  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveAndRedirect(e.target.result);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    // If no new image → keep old one
    const oldImage = editIndex !== null ? announcements[editIndex].image : "";
    saveAndRedirect(oldImage);
  }
});
