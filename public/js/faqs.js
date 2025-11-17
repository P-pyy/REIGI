import { supabaseClient } from '/js/supabase-client.js';

// =======================
// Check Admin Login
// =======================
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";  
  } else {
    supabaseClient.auth.setSession(session.access_token);
  }
})();

// =======================
// MAIN APP LOGIC
// =======================
document.addEventListener("DOMContentLoaded", () => {
  

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
  const imageInput = document.querySelector("#faq-editor-section input[type='file']");

  // Requirements & Steps inputs + containers
  const requirementInput = document.getElementById("requirementInput");
  const stepProcessInput = document.getElementById("stepProcessInput");
  const requirementsContainer = document.getElementById("requirements-container");
  const stepsContainer = document.getElementById("steps-container");
  const requirementsPreview = document.querySelector(".requirementsPreview");
  const stepsPreviewContainer = document.querySelector(".steps-preview-container");


  // Preview elements
  const previewQuestionItem = document.querySelector(".faq-preview .faq-item");
  const previewPostTitle = document.querySelector(".preview-post-title");
  const previewCategoryTitle = document.querySelector(".faq-category-title");
  const previewDate = document.querySelector(".faq-preview-card .text-center.mb-1.text-muted.small");
  const previewText = document.querySelector(".faq-preview-card .preview-text");
  const previewImage = document.querySelector(".faq-preview-card .preview-image");

  const faqSubmitBtn = document.querySelector("#faq-editor-section button.btn-primary");

  // =======================
  // Globals
  // =======================
  let currentCategory = null;
  let editingId = null; 

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
        parentSection.classList.add("d-none"); 
      }

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
  if (questionTitleInput) {
  questionTitleInput.addEventListener("input", () => {
    const questionPreview = document.querySelector(".faq-preview .question-title-preview");
    if (questionPreview) {
      questionPreview.textContent =
        questionTitleInput.value.trim() !== ""
          ? questionTitleInput.value
          : "How to get my Transcript of Records (TOR)?";
    }
  });
}


  // 2. FAQ Post Title → Preview title
if (faqPostTitleInput) {
  faqPostTitleInput.addEventListener("input", () => {
    const faqPreviewLi = document.querySelector(".faq-preview-question ol li.faq-item");
    if (faqPreviewLi) {
      faqPreviewLi.textContent = faqPostTitleInput.value.trim() !== "" 
        ? faqPostTitleInput.value.trim() 
        : "Requirement 1";
    }
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
  if (!tableBody) return;

  tableBody.innerHTML = "";
  data.forEach((faq, index) => {
    let requirements = [];
    let steps = [];
    try { requirements = faq.requirements ? JSON.parse(faq.requirements) : []; } catch(e){ }
    try { steps = faq.steps ? JSON.parse(faq.steps) : []; } catch(e){ }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${faq.question_title || ""}</td>
      <td>${faq.post_title || ""}</td>
      <td>${requirements.map(r => `<p style="margin:0;">${r}</p>`).join("")}</td>
      <td>${steps.map((s,i) => `<p>Step ${i+1}: ${s}</p>`).join("")}</td>
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
  // EDIT FAQ
  document.querySelectorAll(".edit-faq").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const id = link.dataset.id;

      try {
        const { data, error } = await supabaseClient
          .from("faqs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        currentCategory = data.category;
        editingId = id;

        // Hide table sections
        enrollmentSection.classList.add("d-none");
        documentRequestSection.classList.add("d-none");
        graduationClearanceSection.classList.add("d-none");
        faqGrid.classList.add("d-none");

        // Show editor
        faqEditorSection.classList.remove("d-none");

        // Fill form fields
        questionTitleInput.value = data.question_title || "";
        faqPostTitleInput.value = data.post_title || "";
        dateInput.value = data.date_posted || "";
        
        // Parse requirements and steps from JSON
        try {
          requirements = data.requirements ? JSON.parse(data.requirements) : [];
        } catch {
          requirements = [];
        }

        try {
          steps = data.steps ? JSON.parse(data.steps) : [];
        } catch {
          steps = [];
        }

        // Render editor and preview
        renderRequirements();
        renderSteps();

        // Update preview question
        if (previewQuestionItem) {
          previewQuestionItem.innerHTML = `${data.question_title || ""} <i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
        }

        if (previewPostTitle) previewPostTitle.textContent = data.post_title || "Shifting / Program Transfer";
        if (previewCategoryTitle) previewCategoryTitle.textContent = "FREQUENTLY ASKED QUESTIONS:";


        if (previewDate) {
          if (data.date_posted) {
            const d = new Date(data.date_posted);
            previewDate.textContent = `Updated: ${d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`;
          } else {
            previewDate.textContent = "Updated: MM/DD/YY";
          }
        }

        // Clear preview text (if any)
        if (previewText) previewText.innerHTML = "";

        // Image preview
        if (previewImage) {
          if (data.image_url) {
            previewImage.src = data.image_url;
            previewImage.style.display = "block";
          } else {
            previewImage.src = "";
            previewImage.style.display = "none";
          }
        }

        faqSubmitBtn.textContent = "Update FAQ";
      } catch (err) {
        console.error("Error fetching FAQ for edit:", err);
        alert("Failed to load FAQ for editing.");
      }
    });
  });

  // DELETE FAQ
  document.querySelectorAll(".delete-faq").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this FAQ?")) {
        try {
          const { error } = await supabaseClient.from("faqs").delete().eq("id", id);
          if (error) throw error;

          alert("FAQ deleted successfully!");
          loadFaqsForCategory(currentCategory);
        } catch (err) {
          console.error("Error deleting FAQ:", err);
          alert("Error deleting FAQ!");
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

  // Upload image if selected
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

  // Prepare data object
  const faqData = {
    category: currentCategory,
    question_title: questionTitleInput?.value.trim() || "",
    post_title: faqPostTitleInput?.value.trim() || "",
    date_posted: dateInput?.value || null,
    requirements: JSON.stringify(requirements),
    steps: JSON.stringify(steps),
    ...(imageUrl ? { image_url: imageUrl } : {}),
  };

  try {
    if (editingId) {
      const { error } = await supabaseClient
        .from("faqs")
        .update(faqData)
        .eq("id", editingId);
      if (error) throw error;
      alert("FAQ updated successfully ✅");
    } else {
      const { error } = await supabaseClient.from("faqs").insert(faqData);
      if (error) throw error;
      alert("FAQ added successfully ✅");
    }
  } catch (err) {
    console.error(err);
    alert("Error saving FAQ: " + err.message);
  }

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
    if(dateInput) dateInput.value = "";
    if(imageInput) imageInput.value = "";

    // Reset preview content
    if (previewQuestionItem) {
      previewQuestionItem.innerHTML = `<i class="ph-bold ph-arrow-up-right faq-icon"></i>`;
    }
    if (previewPostTitle) previewPostTitle.textContent = "Shifting / Program Transfer";
    if (previewCategoryTitle) previewCategoryTitle.textContent = "FREQUENTLY ASKED QUESTIONS:";
    if (previewDate) previewDate.textContent = "Updated: MM/DD/YY";
    if (previewText) {
      previewText.innerHTML = "";
    }
    if (previewImage) {
      previewImage.src = "";
      previewImage.style.display = "none";
    }
  }

  // =======================
  // Requirements & Steps state + renderers
  // =======================
  let requirements = [];
  let steps = [];

  // Add Requirement handler (plus icon next to input)
  const addRequirementIcon = requirementInput?.nextElementSibling;
  addRequirementIcon?.addEventListener("click", () => {
    const value = requirementInput.value.trim();
    if (!value) return alert("Please enter a requirement");
    requirements.push(value);
    requirementInput.value = "";
    renderRequirements();
  });

  // Add Step handler
  const addStepIcon = stepProcessInput?.nextElementSibling;
  addStepIcon?.addEventListener("click", () => {
    const value = stepProcessInput.value.trim();
    if (!value) return alert("Please enter a step");
    steps.push(value);
    stepProcessInput.value = "";
    renderSteps();
  });

  function renderRequirements() {
    // Editor list
    if (requirementsContainer) {
      requirementsContainer.innerHTML = "";
      if (requirements.length === 0) {
        requirementsContainer.innerHTML = `
          <div class="fill">
            <div class="fill-upper">
              <span>Added Requirement</span>
            </div>
          </div>`;
      } else {
        requirements.forEach((req, idx) => {
          const block = document.createElement('div');
          block.className = 'fill mb-2 d-flex justify-content-between align-items-center';
          const text = document.createElement('div');
          text.className = 'fill-upper';
          text.innerHTML = `<span>${req}</span>`;
          const minus = document.createElement('i');
          minus.className = 'ph-minus ph-minos';
          minus.style.cursor = 'pointer';
          minus.onclick = () => { requirements.splice(idx,1); renderRequirements(); };
          block.appendChild(text);
          block.appendChild(minus);
          requirementsContainer.appendChild(block);
        });
      }
    }

    // Preview list
    if (requirementsPreview) {
      requirementsPreview.innerHTML = "";
      requirements.forEach(req => {
        const li = document.createElement('li');
        li.className = 'faq-item';
        li.textContent = req;
        requirementsPreview.appendChild(li);
      });
    }
  }

  function renderSteps() {
  // Editor list
  if (stepsContainer) {
    stepsContainer.innerHTML = "";
    if (steps.length === 0) {
      stepsContainer.innerHTML = `
        <div class="fill">
          <div class="fill-upper">
            <span>Added Process</span>
          </div>
        </div>`;
    } else {
      steps.forEach((s, idx) => {
        const block = document.createElement('div');
        block.className = 'fill mb-2 d-flex justify-content-between align-items-center';
        const text = document.createElement('div');
        text.className = 'fill-upper';
        text.innerHTML = `<span>${s}</span>`;
        const minus = document.createElement('i');
        minus.className = 'ph-minus ph-minos';
        minus.style.cursor = 'pointer';
        minus.onclick = () => { steps.splice(idx,1); renderSteps(); };
        block.appendChild(text);
        block.appendChild(minus);
        stepsContainer.appendChild(block);
      });
    }
  }

  // Preview container
  if (stepsPreviewContainer) {
    stepsPreviewContainer.innerHTML = "";
    if (steps.length > 0) {
      const ol = document.createElement('ol');
      steps.forEach((s, i) => {
        const li = document.createElement('li');
        li.textContent = `Step ${i + 1}: ${s}`;
        ol.appendChild(li);
      });
      stepsPreviewContainer.appendChild(ol);
    }
  }
}

});


// =======================
// Realtime Updates
// =======================
const faqRealtimeChannel = supabaseClient
  .channel("realtime-faqs")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "faqs" },
    async (payload) => {
      console.log("🔄 FAQ table changed:", payload);
      if (currentCategory) {
        await loadFaqsForCategory(currentCategory);
      }
    }
  )
  .subscribe();
