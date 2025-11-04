// =============================
// Supabase Import
// =============================
import { supabaseClient } from '/js/supabase-client.js';

// =============================
// DOM Elements
// =============================
// Sections
const editorSection = document.getElementById("faq-editor-section");
const faqGrid = document.getElementById("faq-grid");
const enrollmentSection = document.getElementById("enrollment-section");
const documentRequestSection = document.getElementById("document-request-section");

// Buttons
const addButtons = document.querySelectorAll(".add-question-btn");
const submitBtn = document.querySelector(".btn.btn-primary");

// Inputs
const questionTitleInput = editorSection.querySelector("input[placeholder='Question Title']");
const requirementInput = document.getElementById("requirementInput");
const stepProcessInput = document.getElementById("stepProcessInput");
const imageInput = document.getElementById("imageInput");

// Containers for requirements and steps
const requirementContainer = document.querySelectorAll(".fill-upper")[0];
const processContainer = document.querySelectorAll(".fill-upper")[1];

// =============================
// Data Arrays
// =============================
let requirements = [];
let steps = [];

// =============================
// Section Toggle Logic
// =============================
document.querySelectorAll(".card-button").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");

    // Hide all sections
    faqGrid.classList.add("d-none");
    enrollmentSection.classList.add("d-none");
    documentRequestSection.classList.add("d-none");

    // Show selected section
    document.getElementById(targetId).classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// =============================
// Show FAQ Editor
// =============================
addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    editorSection.classList.remove("d-none");

    // Optionally hide other sections
    faqGrid.classList.add("d-none");
    enrollmentSection.classList.add("d-none");
    documentRequestSection.classList.add("d-none");

    window.scrollTo({ top: editorSection.offsetTop, behavior: "smooth" });
  });
});

// =============================
// Add Requirement
// =============================
const addRequirementIcon = requirementInput.nextElementSibling;
addRequirementIcon.addEventListener("click", () => {
  const value = requirementInput.value.trim();
  if (!value) return;

  requirements.push(value);
  requirementInput.value = "";
  renderRequirements();
});

// =============================
// Add Step Process
// =============================
const addStepIcon = stepProcessInput.nextElementSibling;
addStepIcon.addEventListener("click", () => {
  const value = stepProcessInput.value.trim();
  if (!value) return;

  steps.push(value);
  stepProcessInput.value = "";
  renderSteps();
});

// // =============================
// // Render Requirements
// // =============================
// function renderRequirements() {
//   // Clear all old requirement items
//   requirementContainer.innerHTML = "";

//   if (requirements.length === 0) {
//     // Show placeholder if empty
//     requirementContainer.innerHTML = "<span>Added Requirement</span>";
//     return;
//   }

//   // Render each requirement as a span
//   requirements.forEach((r) => {
//     const item = document.createElement("span");
//     item.className = "req-item me-2";
//     item.textContent = r;
//     requirementContainer.appendChild(item);
//   });

//   // Existing minus icon deletes the last requirement
//   const minusIcon = requirementContainer.parentElement.querySelector(".ph-minos");
//   minusIcon.onclick = () => {
//     if (requirements.length > 0) requirements.pop();
//     renderRequirements();
//   };
// }


// // =============================
// // Render Steps
// // =============================
// function renderSteps() {
//   // Clear all old step items
//   processContainer.innerHTML = "";

//   if (steps.length === 0) {
//     // Show placeholder if empty
//     processContainer.innerHTML = "<span>Added Process</span>";
//     return;
//   }

//   // Render each step as a span
//   steps.forEach((s) => {
//     const item = document.createElement("span");
//     item.className = "step-item me-2";
//     item.textContent = s;
//     processContainer.appendChild(item);
//   });

//   // Existing minus icon deletes the last step
//   const minusIcon = processContainer.parentElement.querySelector(".ph-minos");
//   minusIcon.onclick = () => {
//     if (steps.length > 0) steps.pop();
//     renderSteps();
//   };
// }

// =============================
// Dynamic Render Requirements
// =============================
function renderRequirements() {
  const container = requirementContainer.parentElement.parentElement; // .requirements div

  // Remove old extra requirement blocks
  const oldList = container.querySelector(".requirements-list");
  if (oldList) oldList.remove();

  if (requirements.length === 0) {
    requirementContainer.innerHTML = "<span>Added Requirement</span>";
    return;
  }

  // First requirement goes into the original placeholder with minus icon
  requirementContainer.innerHTML = `<span>${requirements[0]}</span>`;
  const firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
  firstMinus.className = "ph-minus ph-minos";
  firstMinus.style.cursor = "pointer";
  firstMinus.onclick = () => {
    requirements.shift(); // Remove first item
    renderRequirements();
  };

  if (!container.contains(firstMinus)) container.querySelector(".fill-upper").appendChild(firstMinus);

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
      minusIcon.onclick = () => {
        requirements.splice(index + 1, 1); // +1 because first is in placeholder
        renderRequirements();
      };

      block.appendChild(textDiv);
      block.appendChild(minusIcon);
      listDiv.appendChild(block);
    });

    container.appendChild(listDiv);
  }
}

// =============================
// Dynamic Render Steps
// =============================
function renderSteps() {
  const container = processContainer.parentElement.parentElement; // .requirements div

  const oldList = container.querySelector(".steps-list");
  if (oldList) oldList.remove();

  if (steps.length === 0) {
    processContainer.innerHTML = "<span>Added Process</span>";
    return;
  }

  // First step goes into the original placeholder with minus icon
  processContainer.innerHTML = `<span>${steps[0]}</span>`;
  const firstMinus = container.querySelector(".ph-minos") || document.createElement("i");
  firstMinus.className = "ph-minus ph-minos";
  firstMinus.style.cursor = "pointer";
  firstMinus.onclick = () => {
    steps.shift(); // Remove first item
    renderSteps();
  };

  if (!container.contains(firstMinus)) container.querySelector(".fill-upper").appendChild(firstMinus);

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
      minusIcon.onclick = () => {
        steps.splice(index + 1, 1);
        renderSteps();
      };

      block.appendChild(textDiv);
      block.appendChild(minusIcon);
      listDiv.appendChild(block);
    });

    container.appendChild(listDiv);
  }
}





// =============================
// Submit → Save to Supabase
// =============================
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const questionTitle = questionTitleInput.value.trim();
  const file = imageInput.files[0];

  if (!questionTitle || requirements.length === 0 || steps.length === 0) {
    alert("⚠️ Please fill all fields and add at least one requirement and process.");
    return;
  }

  let imageUrl = null;

  if (file) {
    const filePath = `kiosk-images/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("kiosk")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      alert("❌ Image upload failed!");
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("kiosk")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabaseClient.from("kiosk").insert([
    {
      question_title: questionTitle,
      requirements: JSON.stringify(requirements),
      steps: JSON.stringify(steps),
      image_url: imageUrl,
    },
  ]);

  if (error) {
    console.error(error);
    alert("❌ Failed to add record!");
  } else {
    alert("✅ Record added successfully!");
    questionTitleInput.value = "";
    requirementInput.value = "";
    stepProcessInput.value = "";
    imageInput.value = "";
    requirements = [];
    steps = [];
    renderRequirements();
    renderSteps();
  }
});
