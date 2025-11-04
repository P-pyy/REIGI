  // =============================
  // Supabase Import
  // =============================
  import { supabaseClient } from '/js/supabase-client.js';

  // =============================
  // Main DOMContentLoaded
  // =============================
  document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------
    // DOM Elements
    // -----------------------------
    const editorSection = document.getElementById("faq-editor-section");
    const faqGrid = document.getElementById("faq-grid");
    const enrollmentSection = document.getElementById("enrollment-section");
    const documentRequestSection = document.getElementById("document-request-section");

    const addButtons = document.querySelectorAll(".add-question-btn");
    const questionTitleInput = editorSection?.querySelector("input[placeholder='Question Title']");
    const requirementInput = document.getElementById("requirementInput");
    const stepProcessInput = document.getElementById("stepProcessInput");
    const imageInput = document.getElementById("imageInput");

    const requirementContainer = document.querySelectorAll(".fill-upper")[0];
    const processContainer = document.querySelectorAll(".fill-upper")[1];

    const requirementsPreview = editorSection?.querySelector(".faq-preview ol");
    const stepsPreviewContainer = editorSection?.querySelector(".preview-text");

    const kioskTableBody = document.querySelector("#document-request-section tbody");

    const toggleBtn = document.querySelector(".toggle-btn");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const mainHeader = document.querySelector(".main-header");
    const rowSumCards = document.querySelector(".row-sum-cards");
    const chartContainer = document.querySelector(".chart-container");
    const faqCard = document.querySelector(".faq-card");

    const logoutBtn = document.querySelector(".logout");

    // -----------------------------
    // Data Arrays
    // -----------------------------
    let requirements = [];
    let steps = [];

    // -----------------------------
    // Sidebar Toggle
    // -----------------------------
    toggleBtn?.addEventListener("click", () => {
      sidebar.classList.toggle("small-sidebar");
      mainContent?.classList.toggle("adjusted");
      mainHeader?.classList.toggle("adjusted");
      rowSumCards?.classList.toggle("adjusted");
      chartContainer?.classList.toggle("adjusted");
      faqCard?.classList.toggle("adjusted");
      window.dispatchEvent(new Event("resize"));
    });

    // -----------------------------
    // Logout Handler
    // -----------------------------
    logoutBtn?.addEventListener("click", async () => {
      console.log("Logout clicked ✅");
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Logout error:", error.message);
      else window.location.href = "/admin/login";
    });

    // -----------------------------
    // Section Toggle Logic
    // -----------------------------
    document.querySelectorAll(".card-button").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");

        faqGrid.classList.add("d-none");
        enrollmentSection.classList.add("d-none");
        documentRequestSection.classList.add("d-none");

        document.getElementById(targetId)?.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // -----------------------------
    // Show FAQ Editor
    // -----------------------------
    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        editorSection?.classList.remove("d-none");

        faqGrid?.classList.add("d-none");
        enrollmentSection?.classList.add("d-none");
        documentRequestSection?.classList.add("d-none");

        window.scrollTo({ top: editorSection.offsetTop, behavior: "smooth" });
      });
    });

    // -----------------------------
    // Add Requirement
    // -----------------------------
    const addRequirementIcon = requirementInput?.nextElementSibling;
    addRequirementIcon?.addEventListener("click", () => {
      const value = requirementInput.value.trim();
      if (!value) return;
      requirements.push(value);
      requirementInput.value = "";
      renderRequirements();
    });

    // -----------------------------
    // Add Step
    // -----------------------------
    const addStepIcon = stepProcessInput?.nextElementSibling;
    addStepIcon?.addEventListener("click", () => {
      const value = stepProcessInput.value.trim();
      if (!value) return;
      steps.push(value);
      stepProcessInput.value = "";
      renderSteps();
    });

    // -----------------------------
    // Image Preview
    // -----------------------------
    imageInput?.addEventListener("change", () => {
      const file = imageInput.files[0];
      const previewImage = editorSection?.querySelector(".preview-image");

      if (file && previewImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else if (previewImage) {
        previewImage.src = "";
        previewImage.style.display = "none";
      }
    });

    // -----------------------------
    // Submit → Save to Supabase
    // -----------------------------
    const submitBtn = editorSection?.querySelector("button.btn-primary");
    submitBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const questionTitle = questionTitleInput.value.trim();
      const file = imageInput.files[0];
      const editingId = editorSection.dataset.editingId || null;

      if (!questionTitle || requirements.length === 0 || steps.length === 0) {
        alert("⚠️ Please fill all fields and add at least one requirement and process.");
        return;
      }

      let imageUrl = null;
      if (file) {
        const filePath = `kiosk-images/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseClient.storage.from("kiosk").upload(filePath, file, { upsert: true });
        if (uploadError) { console.error(uploadError); alert("❌ Image upload failed!"); return; }
        const { data: publicUrlData } = supabaseClient.storage.from("kiosk").getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      if (editingId) {
        const { error } = await supabaseClient.from("kiosk").update({
          question_title: questionTitle,
          requirements: JSON.stringify(requirements),
          steps: JSON.stringify(steps),
          ...(imageUrl ? { image_url: imageUrl } : {}),
        }).eq("id", editingId);
        if (error) alert("❌ Failed to update record!");
        else {
          alert("✅ Record updated successfully!");
          delete editorSection.dataset.editingId;
          submitBtn.textContent = "Add Record";
        }
      } else {
        const { error } = await supabaseClient.from("kiosk").insert([{
          question_title: questionTitle,
          requirements: JSON.stringify(requirements),
          steps: JSON.stringify(steps),
          image_url: imageUrl,
        }]);
        if (error) alert("❌ Failed to add record!");
        else alert("✅ Record added successfully!");
      }

      // Reset form
      questionTitleInput.value = "";
      requirementInput.value = "";
      stepProcessInput.value = "";
      imageInput.value = "";
      requirements = [];
      steps = [];
      renderRequirements();
      renderSteps();

      editorSection?.classList.add("d-none");
      documentRequestSection?.classList.remove("d-none");
      loadKioskData();
    });

    // -----------------------------
    // Functions: Render Requirements & Steps
    // -----------------------------
    function renderRequirements() {
      const container = requirementContainer.parentElement.parentElement;
      container.querySelector(".requirements-list")?.remove();

      if (requirements.length === 0) {
        requirementContainer.innerHTML = "<span>Added Requirement</span>";
      } else {
        requirementContainer.innerHTML = `<span>${requirements[0]}</span>`;
        let firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
        firstMinus.className = "ph-minus ph-minos";
        firstMinus.style.cursor = "pointer";
        firstMinus.onclick = () => { requirements.shift(); renderRequirements(); };
        if (!container.contains(firstMinus)) container.querySelector(".fill-upper")?.appendChild(firstMinus);
      }

      if (requirements.length > 1) {
        const listDiv = document.createElement("div");
        listDiv.className = "requirements-list mt-2";
        requirements.slice(1).forEach((req, index) => {
          const block = document.createElement("div");
          block.className = "fill mb-2 d-flex justify-content-between align-items-center";
          const textDiv = document.createElement("div");
          textDiv.className = "fill-upper";
          const span = document.createElement("span");
          span.textContent = req;
          textDiv.appendChild(span);
          const minusIcon = document.createElement("i");
          minusIcon.className = "ph-minus ph-minos";
          minusIcon.style.cursor = "pointer";
          minusIcon.onclick = () => { requirements.splice(index + 1, 1); renderRequirements(); };
          block.appendChild(textDiv);
          block.appendChild(minusIcon);
          listDiv.appendChild(block);
        });
        container.appendChild(listDiv);
      }

      // Update Preview
      if (requirementsPreview) {
        requirementsPreview.innerHTML = "";
        requirements.forEach(req => {
          const li = document.createElement("li");
          li.textContent = req;
          requirementsPreview.appendChild(li);
        });
      }
    }

    function renderSteps() {
      const container = processContainer.parentElement.parentElement;
      container.querySelector(".steps-list")?.remove();

      if (steps.length === 0) {
        processContainer.innerHTML = "<span>Added Process</span>";
        if (stepsPreviewContainer) stepsPreviewContainer.innerHTML = "";
        return;
      }

      processContainer.innerHTML = `<span>${steps[0]}</span>`;
      let firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
      firstMinus.className = "ph-minus ph-minos";
      firstMinus.style.cursor = "pointer";
      firstMinus.onclick = () => { steps.shift(); renderSteps(); };
      if (!container.contains(firstMinus)) container.querySelector(".fill-upper")?.appendChild(firstMinus);

      if (steps.length > 1) {
        const listDiv = document.createElement("div");
        listDiv.className = "steps-list mt-2";
        steps.slice(1).forEach((step, index) => {
          const block = document.createElement("div");
          block.className = "fill mb-2 d-flex justify-content-between align-items-center";
          const textDiv = document.createElement("div");
          textDiv.className = "fill-upper";
          const span = document.createElement("span");
          span.textContent = step;
          textDiv.appendChild(span);
          const minusIcon = document.createElement("i");
          minusIcon.className = "ph-minus ph-minos";
          minusIcon.style.cursor = "pointer";
          minusIcon.onclick = () => { steps.splice(index + 1, 1); renderSteps(); };
          block.appendChild(textDiv);
          block.appendChild(minusIcon);
          listDiv.appendChild(block);
        });
        container.appendChild(listDiv);
      }

      if (stepsPreviewContainer) {
        stepsPreviewContainer.innerHTML = "";
        const ol = document.createElement("ol");
        ol.style.paddingLeft = "20px";
        steps.forEach((step, i) => {
          const li = document.createElement("li");
          li.style.display = "flex";
          li.style.alignItems = "center";
          li.style.gap = "8px";
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `step-${i}`;
          const label = document.createElement("label");
          label.setAttribute("for", `step-${i}`);
          label.textContent = step;
          li.appendChild(checkbox);
          li.appendChild(label);
          ol.appendChild(li);
        });
        stepsPreviewContainer.appendChild(ol);
      }
    }

    // -----------------------------
    // Load Kiosk Data
    // -----------------------------
    async function loadKioskData() {
      const { data, error } = await supabaseClient.from("kiosk").select("*").order("created_at", { ascending: false });
      if (error) { console.error(error); return; }
      if (!kioskTableBody) return;

      kioskTableBody.innerHTML = "";
      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${row.question_title}</td>
          <td>${row.requirements ? JSON.parse(row.requirements).map((r,i)=>`${i+1}. ${r}`).join("<br>") : ""}</td>
          <td>${row.steps ? JSON.parse(row.steps).map((s,i)=>`${i+1}. ${s}`).join("<br>") : ""}</td>
          <td>${row.image_url ? `<img src="${row.image_url}" alt="Image" style="width:60px;height:auto;border-radius:4px;">` : ""}</td>
          <td>${new Date(row.created_at).toLocaleString()}</td>
          <td>
            <a href="#" class="text-primary me-2 edit-kiosk" data-id="${row.id}"><i class="ph ph-pencil-simple"></i></a>
            <a href="#" class="text-danger delete-kiosk" data-id="${row.id}"><i class="ph ph-trash"></i></a>
          </td>
        `;
        kioskTableBody.appendChild(tr);
      });

      attachKioskEditDeleteHandlers();
    }

    // -----------------------------
    // Edit/Delete Handlers
    // -----------------------------
    function attachKioskEditDeleteHandlers() {
      document.querySelectorAll(".edit-kiosk").forEach(link => {
        link.addEventListener("click", async e => {
          e.preventDefault();
          const id = link.dataset.id;
          const { data, error } = await supabaseClient.from("kiosk").select("*").eq("id", id).single();
          if (error) { alert("❌ Failed to load data."); return; }
          questionTitleInput.value = data.question_title;
          requirements = JSON.parse(data.requirements || "[]");
          steps = JSON.parse(data.steps || "[]");
          renderRequirements();
          renderSteps();
          // --- Add this to show image in preview ---
          const previewImage = editorSection.querySelector(".preview-image");
          if (data.image_url && previewImage) {
            previewImage.src = data.image_url;
            previewImage.style.display = "block";
          } else if (previewImage) {
            previewImage.src = "";
            previewImage.style.display = "none";
  }
          editorSection?.classList.remove("d-none");
          faqGrid?.classList.add("d-none");
          documentRequestSection?.classList.add("d-none");
          editorSection.dataset.editingId = id;
          submitBtn.textContent = "Update Record";
        });
      });

      document.querySelectorAll(".delete-kiosk").forEach(btn => {
        btn.addEventListener("click", async e => {
          e.preventDefault();
          const id = btn.dataset.id;
          if (!confirm("Are you sure you want to delete this record?")) return;
          const { error } = await supabaseClient.from("kiosk").delete().eq("id", id);
          if (error) { alert("❌ Failed to delete record!"); }
          else { alert("✅ Record deleted successfully!"); loadKioskData(); }
        });
      });
    }

    // -----------------------------
    // Realtime Updates
    // -----------------------------
    supabaseClient.channel("realtime-kiosk")
      .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async payload => {
        console.log("🔄 Kiosk table changed:", payload);
        await loadKioskData();
      })
      .subscribe();

    // -----------------------------
    // Initial Load
    // -----------------------------
    loadKioskData();
  });
