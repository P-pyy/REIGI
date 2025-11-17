import { supabaseClient } from '/js/supabase-client.js';

// =======================
// Check Admin Login
// =======================
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";  // Redirect if not logged in
  } else {
    // Set the authenticated session to use admin access rights
    supabaseClient.auth.setSession(session.access_token);
  }
})();

// =======================
// MAIN APP LOGIC
// =======================
document.addEventListener("DOMContentLoaded", () => {
  
  // --- ALL YOUR CODE MUST GO INSIDE HERE ---

  // =======================
  // DOM Elements
  // =======================
  const toggleBtn = document.querySelector(".toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const mainHeader = document.querySelector(".main-header");
  const rowSumCards = document.querySelector(".row-sum-cards");
  const chartContainer = document.querySelector(".chart-container");
  const faqCard = document.querySelector(".faq-card");

  const faqGrid = document.getElementById("faq-grid");
  const enrollmentSection = document.getElementById("enrollment-section");
  const documentRequestSection = document.getElementById("document-request-section");
  const graduationClearanceSection = document.getElementById("graduation-clearance-section");
  const faqEditorSection = document.getElementById("faq-editor-section");

  // Inputs
  const questionTitleInput = document.querySelector("#faq-editor-section input[placeholder='Question Title']");
  const faqPostTitleInput = document.querySelector("#faq-editor-section input[placeholder='FAQ Post Title']");
  const dateInput = document.querySelector("#faq-editor-section input[type='date']");
  const detailsTextarea = document.querySelector("#faq-editor-section textarea"); // This is missing in your HTML, will be null
  const imageInput = document.querySelector("#faq-editor-section input[type='file']");

  // Preview elements
  const previewQuestionItem = document.querySelector(".faq-preview .faq-item");
  const previewTitle = document.querySelector(".faq-preview-card .preview-title");
  const previewDate = document.querySelector(".faq-preview-card .text-center.mb-1.text-muted.small");
  const previewText = document.querySelector(".faq-preview-card .preview-text");
  const previewImage = document.querySelector(".faq-preview-card .preview-image");

  const faqSubmitBtn = document.querySelector("#faq-editor-section button.btn-primary");

  // =======================
  // Globals
  // =======================
  let currentCategory = null;
  let editingId = null; // track edit vs add

  // =======================
  // Sidebar & Logout
  // =======================
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
      console.log("Logout clicked ✅");
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Logout error:", error.message);
      else window.location.href = "/admin/login";
    });
  }

  // =======================
  // Section Toggle
  // =======================
  document.querySelectorAll(".card-button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");
      if (target) {
        faqGrid.classList.add("d-none");
        enrollmentSection.classList.add("d-none");
        documentRequestSection.classList.add("d-none");
        graduationClearanceSection.classList.add("d-none");
        faqEditorSection.classList.add("d-none");

        document.getElementById(target).classList.remove("d-none");

        const category = target.replace("-section", "");
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
        currentCategory = parentSection.id.replace("-section", "");
        // This is the logic you wanted:
        // 1. Hide the parent section (the active table)
        parentSection.classList.add("d-none"); 
      }

      // Reset form + preview every time Add is clicked
      resetFaqForm();
      editingId = null;
      faqSubmitBtn.textContent = "Add FAQ";

      // 2. Hide all other sections (just in case)
      faqGrid.classList.add("d-none");
      enrollmentSection.classList.add("d-none");
      documentRequestSection.classList.add("d-none");
      graduationClearanceSection.classList.add("d-none");

      // 3. Show the editor
      faqEditorSection.classList.remove("d-none");
    });
  });


  // =======================
  // FAQ Editor Live Preview
  // =======================

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

  // 4. Details → Preview text (Note: <textarea> is missing from your HTML)
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

  // =======================
  // Load FAQs
  // =======================
  async function loadFaqsForCategory(category) {
    currentCategory = category;
    const { data, error } = await supabaseClient
      .from("faqs")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading FAQs:", error.message);
      return;
    }

    const tableBody = document.querySelector(`#${category}-section tbody`);
    if (!tableBody) return; // safety check
    
    tableBody.innerHTML = "";
    data.forEach((faq, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${faq.question_title || ""}</td>
        <td>${faq.post_title || ""}</td>
        <td>${faq.details || ""}</td>
        <td>${faq.image_url ? `<img src="${faq.image_url}" style="width:60px;height:auto;border-radius:4px;">` : ""}</td>
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

  // =======================
  // Edit + Delete Handlers
  // =======================
  function attachEditDeleteHandlers() {
    // Edit
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

        currentCategory = data.category;
        editingId = id;

        // Hide table sections
        enrollmentSection.classList.add("d-none");
        documentRequestSection.classList.add("d-none");
        graduationClearanceSection.classList.add("d-none");
        faqGrid.classList.add("d-none");

        // Show editor
        faqEditorSection.classList.remove("d-none");

        // Fill form
        if(questionTitleInput) questionTitleInput.value = data.question_title;
        if(faqPostTitleInput) faqPostTitleInput.value = data.post_title;
        if(dateInput) dateInput.value = data.date_posted || "";
        if(detailsTextarea) detailsTextarea.value = data.details || "";

        // Update preview
        if (previewQuestionItem) {
          previewQuestionItem.innerHTML = (data.question_title ? `1. ${data.question_title}` : "1. How to get my Transcript of Records (TOR)?") + ` <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
        }
        if (previewTitle) previewTitle.textContent = data.post_title || "Shifting / Program Transfer";
        
        if (previewDate) {
          if (data.date_posted) {
            const d = new Date(data.date_posted);
            previewDate.textContent = "Updated: " + d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
          } else {
            previewDate.textContent = "Updated: MM/DD/YY";
          }
        }
        
        if (previewText) {
          previewText.innerHTML = data.details ? data.details.split("\n").filter(p => p.trim() !== "").map(p => `<p>${p}</p>`).join("") : `<p>"Lorem ipsum dolor sit amet..."</p>`;
        }

        // Image preview
        if (data.image_url) {
          previewImage.src = data.image_url;
          previewImage.style.display = "block";
        } else {
          previewImage.src = "";
          previewImage.style.display = "none";
        }

        faqSubmitBtn.textContent = "Update FAQ";
      });
    });

    // Delete
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
            loadFaqsForCategory(currentCategory);
          }
        }
      });
    });
  }

  // =======================
  // Submit Handler
  // =======================
  faqSubmitBtn.addEventListener("click", async e => {
    e.preventDefault();
    if (!currentCategory) {
      alert("⚠️ No category selected. Please go back and choose a section.");
      return;
    }
    
    // Note: Your HTML form is missing 'detailsTextarea'
    // This will only save the question_title, post_title, date and image
    
    const file = imageInput?.files[0];
    let imageUrl = null;

    if (file) {
      const { data, error } = await supabaseClient.storage
        .from("faqs")
        .upload(`faq-images/${Date.now()}-${file.name}`, file, { upsert: true });
      if (error) {
        alert("Image upload failed: " + error.message);
        return;
      }
      const { data: publicData } = supabaseClient.storage.from("faqs").getPublicUrl(data.path);
      imageUrl = publicData.publicUrl;
    }

    const faqData = {
      category: currentCategory,
      question_title: questionTitleInput?.value.trim() || "",
      post_title: faqPostTitleInput?.value.trim() || "",
      details: detailsTextarea?.value.trim() || "",
      date_posted: dateInput?.value || null,
      ...(imageUrl ? { image_url: imageUrl } : (editingId ? {} : {image_url: null})),
    };

    // If we are editing and NOT uploading a new image, we don't want to overwrite
    // the existing image_url with null.
    if (editingId && !imageUrl) {
      delete faqData.image_url; // Don't update the image URL if no new file
    }

    if (editingId) {
      // Update
      const { error } = await supabaseClient
        .from("faqs")
        .update(faqData)
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
      const { error } = await supabaseClient.from("faqs").insert(faqData);
      if (error) {
        alert("Error adding FAQ: " + error.message);
      } else {
        alert("FAQ added successfully ✅");
        resetFaqForm();
      }
    }

    // Hide editor + show table again
    faqEditorSection.classList.add("d-none");
    document.getElementById(`${currentCategory}-section`).classList.remove("d-none");
    loadFaqsForCategory(currentCategory);
  });

  // =======================
  // Reset Form Function
  // =======================
  function resetFaqForm() {
    if(questionTitleInput) questionTitleInput.value = "";
    if(faqPostTitleInput) faqPostTitleInput.value = "";
    if(detailsTextarea) detailsTextarea.value = "";
    if(dateInput) dateInput.value = "";
    if(imageInput) imageInput.value = "";

    // Reset preview content
    if (previewQuestionItem) {
      previewQuestionItem.innerHTML = `1. How to get my Transcript of Records (TOR)? <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
    }
    if (previewTitle) previewTitle.textContent = "Shifting / Program Transfer";
    if (previewDate) previewDate.textContent = "Updated: MM/DD/YY";
    if (previewText) {
      previewText.innerHTML = `
        <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."</p>
        <p>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC ...</p>
      `;
    }
    if (previewImage) {
      previewImage.src = "";
      previewImage.style.display = "none";
    }
  }
});