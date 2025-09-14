// =======================
// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE"; // replace with your actual anon key

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// =======================
// Globals
// =======================
let currentCategory = null;

// =======================
// Sidebar Loader
// =======================
fetch("sidebar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("sidebar-container").innerHTML = data;

    // Highlight current page
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach((link) => {
      if (link.getAttribute("href") === currentPage)
        link.classList.add("active");
    });

    // Sidebar toggle
    const toggleBtn = document.querySelector(".toggle-btn");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const mainHeader = document.querySelector(".main-header");

    if (toggleBtn && sidebar && mainContent && mainHeader) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("small-sidebar");
        const isSmall = sidebar.classList.contains("small-sidebar");
        mainContent.style.marginLeft = isSmall ? "80px" : "278px";
        mainContent.style.width = isSmall
          ? "calc(100% - 80px)"
          : "calc(100% - 278px)";
        mainHeader.style.width = isSmall
          ? "calc(100% - 80px)"
          : "calc(100% - 278px)";
        mainHeader.style.marginLeft = isSmall ? "80px" : "278px";
        window.dispatchEvent(new Event("resize"));
      });
    }

    // Logout handler
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (!error) window.location.href = "login.html";
      });
    }
  })
  .catch((error) => console.error("Error loading sidebar:", error));

// =======================
// Section Toggle
// =======================
const faqGrid = document.getElementById("faq-grid");

document.querySelectorAll(".card-button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-target");
    if (target) {
      faqGrid.classList.add("d-none");
      document
        .querySelectorAll(
          "#enrollment-section, #document-request-section, #graduation-clearance-section"
        )
        .forEach((sec) => sec.classList.add("d-none"));

      document.getElementById(target).classList.remove("d-none");

      const category = target.replace("-section", ""); // ✅ keep same as ID
      loadFaqsForCategory(category);
    }
  });
});

// =======================
// Add Question Button
// =======================
document.querySelectorAll(".add-question-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const parentSection = btn.closest("div[id$='section']");
    if (parentSection) {
      currentCategory = parentSection.id.replace("-section", ""); // ✅ no underscore conversion
    }

    faqGrid.classList.add("d-none");
    document
      .querySelectorAll(
        "#enrollment-section, #document-request-section, #graduation-clearance-section"
      )
      .forEach((sec) => sec.classList.add("d-none"));

    document.getElementById("faq-editor-section").classList.remove("d-none");
  });
});

// =======================
// FAQ Form Submit
// =======================
document
  .querySelector("#faq-editor-section button.btn-primary")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentCategory) {
      alert("⚠️ No category selected. Please go back and choose a section.");
      return;
    }

    const questionTitle = document
      .querySelector("input[placeholder='Question Title']")
      .value.trim();
    const postTitle = document
      .querySelector("input[placeholder='FAQ Post Title']")
      .value.trim();
    const details = document.querySelector("textarea").value.trim();
    const datePosted = document.querySelector("input[type='date']").value;
    const fileInput = document.querySelector("input[type='file']");
    const file = fileInput?.files[0];

    let imageUrl = null;

    if (file) {
      const { data, error } = await supabaseClient.storage
        .from("faqs")
        .upload(`faq-images/${Date.now()}-${file.name}`, file, { upsert: true });

      if (error) {
        alert("Image upload failed: " + error.message);
        return;
      }

      const { data: publicData } = supabaseClient.storage
        .from("faqs")
        .getPublicUrl(data.path);
      imageUrl = publicData.publicUrl;
    }

    const { error: insertError } = await supabaseClient.from("faqs").insert({
      category: currentCategory, // ✅ now matches section IDs directly
      question_title: questionTitle,
      post_title: postTitle,
      details,
      image_url: imageUrl,
      date_posted: datePosted,
    });

    if (insertError) {
      alert("Insert failed: " + insertError.message);
    } else {
      alert("FAQ added successfully ✅");
      loadFaqsForCategory(currentCategory);
      fileInput.value = "";
      document.querySelector("img.preview-image").style.display = "none";
      document.getElementById("faq-editor-section").classList.add("d-none");
      document
        .getElementById(`${currentCategory}-section`)
        .classList.remove("d-none");
    }
  });


// =======================
// Load FAQs with category-based ID
// =======================
async function loadFaqsForCategory(category) {
  const { data, error } = await supabaseClient
    .from("faqs")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: true }); // oldest first for natural numbering

  if (error) {
    console.error("Error loading FAQs:", error.message);
    return;
  }

  const tableBody = document.querySelector(`#${category}-section tbody`);
  tableBody.innerHTML = "";

  // 🔑 Generate category-local ID
  data.forEach((faq, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td> <!-- instead of faq.id -->
      <td>${faq.question_title}</td>
      <td>${faq.post_title}</td>
      <td>${faq.details || ""}</td>
      <td>${
        faq.image_url
          ? `<img src="${faq.image_url}" style="width:60px;height:auto;border-radius:4px;">`
          : ""
      }</td>
      <td>${faq.date_posted || ""}</td>
      <td>
        <a href="#" class="text-primary me-2 edit-faq" data-id="${faq.id}">
          Edit
        </a>
        <a href="#" class="text-danger delete-faq" data-id="${faq.id}">
          <i class="ph ph-trash"></i>
        </a>
      </td>

    `;
    tableBody.appendChild(row);
  });
}


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
const previewImage        = document.querySelector(".faq-preview-card .preview-image"); // <-- add preview image element

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

// =======================
// Edit FAQ
// =======================
function attachEditDeleteHandlers() {
  document.querySelectorAll(".edit-faq").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const id = link.dataset.id;

      const { data, error } = await supabaseClient
        .from("faqs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching FAQ:", error);
        return;
      }

      // Show editor
      document.getElementById("faq-editor-section").classList.remove("d-none");

      // Fill in the form
      document.querySelector("#faq-editor-section input[placeholder='Question Title']").value = data.question_title;
      document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']").value = data.post_title;
      document.querySelector("#faq-editor-section input[type='date']").value = data.date_posted;
      document.querySelector("#faq-editor-section textarea").value = data.details;

      // If image exists, show preview
      if (data.image_url) {
        const previewImg = document.querySelector("#faq-editor-section .preview-image");
        previewImg.src = data.image_url;
        previewImg.style.display = "block";
      }

      // Update mode
      const submitBtn = document.querySelector("#faq-editor-section button.btn-primary");
      submitBtn.textContent = "Update FAQ";
      submitBtn.onclick = async () => {
        const updatedData = {
          question_title: document.querySelector("#faq-editor-section input[placeholder='Question Title']").value,
          post_title: document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']").value,
          date_posted: document.querySelector("#faq-editor-section input[type='date']").value,
          details: document.querySelector("#faq-editor-section textarea").value,
        };

        const { error: updateError } = await supabaseClient
          .from("faqs")
          .update(updatedData)
          .eq("id", id);

        if (updateError) {
          alert("Error updating FAQ!");
          console.error(updateError);
        } else {
          alert("FAQ updated successfully!");
          location.reload();
        }
      };
    });
  });

  // =======================
  // Delete FAQ
  // =======================
  document.querySelectorAll(".delete-faq").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();
      const id = btn.dataset.id;

      if (confirm("Are you sure you want to delete this FAQ?")) {
        const { error } = await supabaseClient.from("faqs").delete().eq("id", id);
        if (error) {
          alert("Error deleting FAQ!");
          console.error(error);
        } else {
          alert("FAQ deleted successfully!");
          location.reload();
        }
      }
    });
  });
}


