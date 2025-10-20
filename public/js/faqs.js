// Supabase
import { supabase } from "./supabaseClient.js";

// Section Toggle
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

// Add Question Button
document.querySelectorAll(".add-question-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const parentSection = btn.closest("div[id$='section']");
    if (parentSection) {
      currentCategory = parentSection.id.replace("-section", "");
    }

    // Reset form + preview every time Add is clicked
    resetFaqForm();
    editingId = null;
    faqSubmitBtn.textContent = "Add FAQ";

    faqGrid.classList.add("d-none");
    document.querySelectorAll(
      "#enrollment-section, #document-request-section, #graduation-clearance-section"
    ).forEach((sec) => sec.classList.add("d-none"));

    document.getElementById("faq-editor-section").classList.remove("d-none");
  });
});


// FAQ Editor Live Preview 

// Inputs
const questionTitleInput = document.querySelector("#faq-editor-section input[placeholder='Question Title']");
const faqPostTitleInput  = document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']");
const dateInput          = document.querySelector("#faq-editor-section input[type='date']");
const detailsTextarea    = document.querySelector("#faq-editor-section textarea");
const imageInput         = document.querySelector("#faq-editor-section input[type='file']"); 

// Preview elements
const previewQuestionItem = document.querySelector(".faq-preview .faq-item");
const previewTitle        = document.querySelector(".faq-preview-card .preview-title");
const previewDate         = document.querySelector(".faq-preview-card .text-center.mb-1.text-muted.small");
const previewText         = document.querySelector(".faq-preview-card .preview-text");
const previewImage        = document.querySelector(".faq-preview-card .preview-image"); 

// Question Title → Preview list
if (questionTitleInput && previewQuestionItem) {
  questionTitleInput.addEventListener("input", () => {
    previewQuestionItem.innerHTML =
      (questionTitleInput.value.trim() !== ""
        ? `1. ${questionTitleInput.value}`
        : "1. How to get my Transcript of Records (TOR)?") +
      ` <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
  });
}

//FAQ Post Title → Preview title
if (faqPostTitleInput && previewTitle) {
  faqPostTitleInput.addEventListener("input", () => {
    previewTitle.textContent =
      faqPostTitleInput.value.trim() !== ""
        ? faqPostTitleInput.value
        : "Shifting / Program Transfer";
  });
}

// Date → Preview date
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

// Details → Preview text (supports multiple paragraphs)
if (detailsTextarea && previewText) {
  detailsTextarea.addEventListener("input", () => {
    if (detailsTextarea.value.trim() !== "") {
      const paragraphs = detailsTextarea.value
        .split("\n")
        .filter(p => p.trim() !== "") 
        .map(p => `<p>${p}</p>`) 
        .join(""); 

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
        previewImage.style.display = "block"; 
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.src = "";
      previewImage.style.display = "none";
    }
  });
}


// Globals
let currentCategory = null;
let editingId = null;

// Load FAQs with category-based ID
async function loadFaqsForCategory(category) {
   currentCategory = category;
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading FAQs:", error.message);
    return;
  }

  const tableBody = document.querySelector(`#${category}-section tbody`);
  tableBody.innerHTML = "";

  data.forEach((faq, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
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
        <a href="#" class="text-primary me-2 edit-faq" data-id="${faq.id}">Edit</a>
        <a href="#" class="text-danger delete-faq" data-id="${faq.id}">
          <i class="ph ph-trash"></i>
        </a>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachEditDeleteHandlers(); 
}

// Edit + Delete Handlers
function attachEditDeleteHandlers() {
  // Edit
  document.querySelectorAll(".edit-faq").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const id = link.dataset.id;

      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching FAQ:", error);
        return;
      }

      currentCategory = data.category;
      editingId = id;

      // Hide all sections
      document.querySelectorAll(
        "#enrollment-section, #document-request-section, #graduation-clearance-section"
      ).forEach(sec => sec.classList.add("d-none"));

      // Show editor
      document.getElementById("faq-editor-section").classList.remove("d-none");

      // Fill form
      document.querySelector("#faq-editor-section input[placeholder='Question Title']").value = data.question_title;
      document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']").value = data.post_title;
      document.querySelector("#faq-editor-section input[type='date']").value = data.date_posted || "";
      document.querySelector("#faq-editor-section textarea").value = data.details || "";

      // Update preview immediately
      previewQuestionItem.innerHTML =
        (data.question_title
          ? `1. ${data.question_title}`
          : "1. How to get my Transcript of Records (TOR)?") +
        ` <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;

      previewTitle.textContent = data.post_title || "Shifting / Program Transfer";

      if (data.date_posted) {
        const d = new Date(data.date_posted);
        previewDate.textContent =
          "Updated: " +
          d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
      } else {
        previewDate.textContent = "Updated: MM/DD/YY";
      }

      previewText.innerHTML = data.details
        ? data.details
            .split("\n")
            .filter(p => p.trim() !== "")
            .map(p => `<p>${p}</p>`)
            .join("")
        : `<p>"Lorem ipsum dolor sit amet..."</p>`;

      // Image preview
      const previewImg = document.querySelector("#faq-editor-section .preview-image");
      if (data.image_url) {
        previewImg.src = data.image_url;
        previewImg.style.display = "block";
      } else {
        previewImg.src = "";
        previewImg.style.display = "none";
      }

      // Update button
      const submitBtn = document.querySelector("#faq-editor-section button.btn-primary");
      submitBtn.textContent = "Update FAQ";
  
    });
  });

  // Delete
  document.querySelectorAll(".delete-faq").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();
      const id = btn.dataset.id;

      if (confirm("Are you sure you want to delete this FAQ?")) {
        const { error } = await supabase.from("faqs").delete().eq("id", id);
        if (error) {
          alert("Error deleting FAQ!");
          console.error(error);
        } else {
          alert("FAQ deleted successfully!");
          loadFaqsForCategory(currentCategory);
        }
      }
    });
  });
}

// Submit Handler
const faqSubmitBtn = document.querySelector("#faq-editor-section button.btn-primary");
faqSubmitBtn.addEventListener("click", async e => {
  e.preventDefault();

  if (!currentCategory) {
    alert("⚠️ No category selected. Please go back and choose a section.");
    return;
  }

  const questionTitleInput = document.querySelector("input[placeholder='Question Title']");
  const postTitleInput = document.querySelector("input[placeholder='FAQ Post Title']");
  const detailsTextarea = document.querySelector("textarea");
  const dateInput = document.querySelector("input[type='date']");
  const fileInput = document.querySelector("input[type='file']");
  const file = fileInput?.files[0];
  let imageUrl = null;

  // Upload image if any
  if (file) {
    const { data, error } = await supabase.storage
      .from("faqs")
      .upload(`faq-images/${Date.now()}-${file.name}`, file, { upsert: true });

    if (error) {
      alert("Image upload failed: " + error.message);
      return;
    }

    const { data: publicData } = supabase.storage.from("faqs").getPublicUrl(data.path);
    imageUrl = publicData.publicUrl;
  }

  if (editingId) {
    // Update
    const { error } = await supabase
      .from("faqs")
      .update({
        question_title: questionTitleInput.value.trim(),
        post_title: postTitleInput.value.trim(),
        details: detailsTextarea.value.trim(),
        date_posted: dateInput.value,
        ...(imageUrl ? { image_url: imageUrl } : {}),
        category: currentCategory,
      })
      .eq("id", editingId);

    if (error) {
      alert("Error updating FAQ: " + error.message);
    } else {
      alert("FAQ updated successfully ✅");
      resetFaqForm();
    }

    editingId = null;
    faqSubmitBtn.textContent = "Add FAQ";
  } else {
    // Insert
    const { error } = await supabase.from("faqs").insert({
      category: currentCategory,
      question_title: questionTitleInput.value.trim(),
      post_title: postTitleInput.value.trim(),
      details: detailsTextarea.value.trim(),
      image_url: imageUrl,
      date_posted: dateInput.value,
    });

    if (error) {
      alert("Error adding FAQ: " + error.message);
    } else {
      alert("FAQ added successfully ✅");
      resetFaqForm(); 
    }
  }

  // Reset form inputs after submit
  questionTitleInput.value = "";
  postTitleInput.value = "";
  detailsTextarea.value = "";
  dateInput.value = "";
  fileInput.value = "";
  document.querySelector("img.preview-image").style.display = "none";

  // Hide editor + show table again
  document.getElementById("faq-editor-section").classList.add("d-none");
  document.getElementById(`${currentCategory}-section`).classList.remove("d-none");
  loadFaqsForCategory(currentCategory);

   // Reload table
  loadFaqsForCategory(currentCategory);
});

function resetFaqForm() {
  // Clear form inputs
  questionTitleInput.value = "";
  faqPostTitleInput.value = "";
  detailsTextarea.value = "";
  dateInput.value = "";
  imageInput.value = "";

  // Reset preview content
  previewQuestionItem.innerHTML =
    `1. How to get my Transcript of Records (TOR)? <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
  previewTitle.textContent = "Shifting / Program Transfer";
  previewDate.textContent = "Updated: MM/DD/YY";
  previewText.innerHTML = `
    <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."</p>
    <p>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC ...</p>
  `;
  previewImage.src = "";
  previewImage.style.display = "none";
}







