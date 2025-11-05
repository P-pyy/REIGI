// Import Supabase Client
import { supabaseClient } from '/js/supabase-client.js';


// Main Logic
document.addEventListener("DOMContentLoaded", async () => {
  const faqOptionContainer = document.querySelector(".faq-option-container");
  const overlay = document.querySelector(".container-overlay");
  const backBtn = document.getElementById("back-btn");
  const backdrop = document.getElementById("overlay-backdrop");

  const faqName = document.querySelector(".faq-name");
  const requirementsList = document.querySelector(".faq-preview ol");
  const stepsContainer = document.querySelector(".preview-text");
  const previewImage = document.querySelector(".preview-image");

  // Load FAQ Data from Supabase
  async function loadFAQs() {
    const { data, error } = await supabaseClient
      .from("kiosk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error loading FAQs:", error);
      return;
    }

    faqOptionContainer.innerHTML = ""; 

    data.forEach((faq) => {
      const faqOption = document.createElement("div");
      faqOption.classList.add("faq-option");
      faqOption.dataset.id = faq.id;
      faqOption.innerHTML = `
        <i class="ph ph-magnifying-glass"></i>
        <span class="faq-option-name">${faq.question_title}</span>
      `;
      faqOptionContainer.appendChild(faqOption);
    });

    attachFAQClickHandlers(data);
  }
  

  // Show Overlay with FAQ Details
  function attachFAQClickHandlers(faqData) {
    document.querySelectorAll(".faq-option").forEach((option) => {
      option.addEventListener("click", () => {
        const selected = faqData.find(f => f.id == option.dataset.id);
        if (!selected) return;

        overlay.classList.add("is-visible");
        backdrop.classList.add("is-visible");

        // Display FAQ Details
        faqName.textContent = selected.question_title;

        // Requirements
        requirementsList.innerHTML = "";
        const reqs = JSON.parse(selected.requirements || "[]");
        reqs.forEach(r => {
          const li = document.createElement("li");
          li.textContent = r;
          requirementsList.appendChild(li);
        });

        // Steps
        stepsContainer.innerHTML = "";
        const steps = JSON.parse(selected.steps || "[]");

        steps.forEach((step, i) => {
        const stepBlock = document.createElement("div");
        stepBlock.classList.add("checkbox-wrapper-4", "mb-3");

        stepBlock.innerHTML = `
            <input class="inp-cbx" id="step-${i}" type="checkbox"/>
            <label class="cbx" for="step-${i}">
            <span>
                <svg width="12px" height="10px">
                <use xlink:href="#check-4"></use>
                </svg>
            </span>
            </label>
            <svg class="inline-svg">
            <symbol id="check-4" viewBox="0 0 12 10">
                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </symbol>
            </svg>
            <p class="checkbox-content">${step}</p>
        `;

        stepsContainer.appendChild(stepBlock);
        });


        // Image
        if (selected.image_url) {
          previewImage.src = selected.image_url;
          previewImage.style.display = "block";
        } else {
          previewImage.style.display = "none";
        }
      });
    });
  }


  // Hide Overlay on Back Click
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
  });

  // Initial Load
  loadFAQs();


// Realtime Listener for Kiosk Table
supabaseClient.channel("realtime-kiosk-app")
  .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async (payload) => {
    console.log("🔄 Kiosk data changed:", payload);
    await loadFAQs(); // reload updated list automatically
  })
  .subscribe();



// Read Aloud Button Function
const readBtn = document.querySelector(".speak-btn");

if (readBtn) {
  readBtn.addEventListener("click", () => {
    const synth = window.speechSynthesis;
    synth.cancel(); // stop any ongoing speech

    // Get the FAQ title
    const title = faqName.textContent.trim();
    let textToRead = `Process for ${title}. `;

    // Get Requirements
    const requirements = Array.from(requirementsList.querySelectorAll("li")).map(li => li.textContent.trim());
    if (requirements.length > 0) {
      textToRead += `Here are the requirements: ${requirements.join(", ")}. `;
    } else {
      textToRead += `No requirements listed. `;
    }

    // Get Steps
    const steps = Array.from(stepsContainer.querySelectorAll(".checkbox-content")).map(p => p.textContent.trim());
    if (steps.length > 0) {
      textToRead += `Now, follow these steps: ${steps.join(". ")}.`;
    } else {
      textToRead += `No steps available.`;
    }

    // Speak
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1; // normal speed
    utterance.pitch = 1; // normal pitch
    utterance.lang = "en-US"; // you can set "en-PH" or other language code

    synth.speak(utterance);
  });
}

});
