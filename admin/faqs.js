//  <!-- Load Sidebar Script -->
fetch('sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('sidebar-container').innerHTML = data;

    // Highlight current page
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach(link => {
      if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });

    // Toggle sidebar
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainHeader = document.querySelector('.main-header');

    if (toggleBtn && sidebar && mainContent && mainHeader) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('small-sidebar');
        const isSmall = sidebar.classList.contains('small-sidebar');
        mainContent.classList.toggle('adjusted');
        mainContent.style.marginLeft = isSmall ? '80px' : '278px';
        mainContent.style.width = isSmall ? 'calc(100% - 80px)' : 'calc(100% - 278px)';
        mainHeader.style.width = isSmall ? 'calc(100% - 80px)' : 'calc(100% - 278px)';
        mainHeader.style.marginLeft = isSmall ? '80px' : '278px';
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Logout handler
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        console.log("Logout clicked");
        const { error } = await supabaseClient.auth.signOut(); // ✅ use correct client
        if (error) console.error("Logout error:", error.message);
        else window.location.href = "login.html";
      });
    } else {
      console.warn("⚠️ Logout button not found in sidebar!");
    }
  })
  .catch(error => console.error('Error loading sidebar:', error));

// <!-- Toggle Script -->
  const faqGrid = document.getElementById("faq-grid");

  document.querySelectorAll(".card-button").forEach(button => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");

      if (target) {
        faqGrid.classList.add("d-none");

        document.querySelectorAll("#enrollment-section, #document-request-section, #graduation-clearance-section")
          .forEach(sec => sec.classList.add("d-none"));

        document.getElementById(target).classList.remove("d-none");
      }
    });
  });

//   Table Function
    document.addEventListener("DOMContentLoaded", function() {
      const tbody = document.querySelector(".announcement-table tbody");
      const overlay = document.getElementById("loading-overlay");

      function showLoading() { overlay.classList.add("show"); }
      function hideLoading() { overlay.classList.remove("show"); }

      function renderTable() {
        tbody.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

        announcements.forEach((item, index) => {
          const dateObj = new Date(item.dateTime);
          const formattedDateTime = dateObj.toLocaleString("en-US", { year:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:true });

          const row = document.createElement("tr");
          row.classList.add("fade-in");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.title}</td>
            <td>${item.details}</td>
            <td>${item.questionDetails || ""}</td>
            <td><img src="${item.image}" alt="announcement image" style="width:60px; height:auto; border-radius:4px;"></td>
            <td>${formattedDateTime}</td>
            <td>
              <a href="admin_announcement_edit.html?index=${index}" class="text-primary me-2 edit-link">Edit</a>
              <a href="#" class="text-danger trash-icon" data-index="${index}">
                <i class="ph ph-trash"></i>
              </a>
            </td>
          `;
          tbody.appendChild(row);
        });

        // Attach delete events
        document.querySelectorAll(".trash-icon").forEach(btn => {
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            const index = this.dataset.index;
            if(confirm("Are you sure you want to delete this announcement?")) {
              let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
              announcements.splice(index, 1);
              localStorage.setItem("announcements", JSON.stringify(announcements));
              renderTable();
            }
          });
        });

        // Render Phosphor icons
        if(window.PhosphorIcons) window.PhosphorIcons.replace();
      }

      showLoading();
      setTimeout(() => { renderTable(); hideLoading(); }, 300);

      // Auto-update when localStorage changes
      window.addEventListener("storage", e => { if(e.key === "announcements") renderTable(); });
      document.addEventListener("visibilitychange", () => { if(!document.hidden) renderTable(); });
    });

   // Handle Add New Question buttons
document.querySelectorAll(".add-question-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Hide grid & all sections
    document.getElementById("faq-grid").classList.add("d-none");
    document.querySelectorAll("#enrollment-section, #document-request-section, #graduation-clearance-section")
      .forEach(sec => sec.classList.add("d-none"));

    // Show the embedded editor instead of fetching
    const editorSection = document.getElementById("faq-editor-section");
    editorSection.classList.remove("d-none");
  });
});

// ===== FAQ Editor Live Preview =====

// Inputs
const questionTitleInput = document.querySelector("#faq-editor-section input[placeholder='Question Title']");
const faqPostTitleInput  = document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']");
const dateInput          = document.querySelector("#faq-editor-section input[type='date']");
const detailsTextarea    = document.querySelector("#faq-editor-section textarea");
const imageInput         = document.querySelector("#faq-editor-section input[type='file']"); // <-- add image input

// Preview elements
const previewQuestionItem = document.querySelector(".faq-preview .faq-item");
const previewTitle        = document.querySelector(".faq-preview-card .preview-title");
const previewDate         = document.querySelector(".faq-preview-card .text-center.mb-1.text-muted.small");
const previewText         = document.querySelector(".faq-preview-card .preview-text");
const previewImage = document.querySelector("#faq-editor-section .preview-image");


// 1. Question Title → Preview list
if (questionTitleInput && previewQuestionItem) {
  questionTitleInput.addEventListener("input", () => {
    previewQuestionItem.innerHTML =
      (questionTitleInput.value.trim() !== ""
        ? `1. ${questionTitleInput.value}`
        : "1. How to get my Transcript of Records (TOR)?") +
      ` <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
  });
}

// 2. FAQ Post Title → Preview title
if (faqPostTitleInput && previewTitle) {
  faqPostTitleInput.addEventListener("input", () => {
    previewTitle.textContent =
      faqPostTitleInput.value.trim() !== ""
        ? faqPostTitleInput.value
        : "Shifting / Program Transfer";
  });
}

// 3. Date → Preview date
if (dateInput && previewDate) {
  dateInput.addEventListener("input", () => {
    if (dateInput.value) {
      const d = new Date(dateInput.value);
      const formatted = d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit"
      });
      previewDate.textContent = `Updated: ${formatted}`;
    } else {
      previewDate.textContent = "Updated: MM/DD/YY";
    }
  });
}

// 4. Details → Preview text (supports multiple paragraphs)
if (detailsTextarea && previewText) {
  detailsTextarea.addEventListener("input", () => {
    if (detailsTextarea.value.trim() !== "") {
      const paragraphs = detailsTextarea.value
        .split("\n") // split by new lines
        .filter(p => p.trim() !== "") // ignore empty lines
        .map(p => `<p>${p}</p>`) // wrap each in <p>
        .join(""); // join them together

      previewText.innerHTML = paragraphs;
    } else {
      previewText.innerHTML = `
        <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."</p>
        <p>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC ...</p>
      `;
    }
  });
}

// 5. Image → Preview image
if (imageInput && previewImage) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block"; // show image
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.src = "";
      previewImage.style.display = "none"; // hide if no image
    }
  });
}
