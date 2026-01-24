import { supabaseClient } from '/js/supabase-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  let activeFlow = null; // "request" | "claiming" | "enrollment" | "details"

  const searchInput = document.querySelector(".input-voice-container input");
  const faqOptionContainer = document.querySelector(".faq-option-container");

  const mainFaqContainer = document.querySelector(".search-container .faq-option-container");
  const enrollmentFaqContainer = document.querySelector(".container-enrollment .faq-option-container");
  
  const overlay = document.querySelector(".container-overlay"); 
  const backdrop = document.getElementById("overlay-backdrop");

  const voiceBtn = document.querySelector(".voice-btn");
  const voiceOverlay = document.querySelector(".voice-search-overlay");
  const voiceBackdrop = document.getElementById("voice-overlay-backdrop");
  const voiceBackBtn = document.querySelector(".voice-back-btn");
  const voiceCancelBtn = document.querySelector(".voice-cancel-btn");

  // Priority & Form & Number Containers (Shared Steps)
  const priorityOverlay = document.querySelector(".container-3");
  const formOverlay = document.querySelector(".container-overlay-form");
  const overlayNumber = document.querySelector(".container-overlay-number");
  
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const backBtn3 = document.getElementById("back-btn-3");
  const finishBtn = document.getElementById("finish-btn");
  const backBtn2 = document.getElementById("back-btn-2"); // Back button on Form
  const finishBtnNum = document.getElementById("finish-btn-num"); // Finish button on Number

  // Form Inputs
  const firstNameInput = formOverlay.querySelector('input[placeholder="First Name"]');
  const lastNameInput = formOverlay.querySelector('input[placeholder="Last Name"]');
  const numberPreview = document.querySelector(".number-preview");

  // Voice/Speech elements
  const faqName = document.querySelector(".faq-name");
  const detailsOverlay = document.querySelector(".container-2");
  const requirementsList = detailsOverlay.querySelector(".faq-preview ol");
  const stepsContainer = detailsOverlay.querySelector(".preview-text"); // Scoped to details overlay
  const previewImage = document.querySelector(".preview-image");
  const readBtn = document.querySelector(".speak-btn");

  // ---------------------------------------------------------
  // 2. MAIN MENU BUTTONS & OVERLAYS
  // ---------------------------------------------------------
  const requestBtn = document.querySelector(".request-btn"); 
  const requestOverlay = document.querySelector(".container-request");
  
  const claimingBtn = document.querySelector(".claiming-btn");
  const claimingOverlay = document.querySelector(".container-claiming");
  
  const enrollmentBtn = document.querySelector(".enrollment-btn");
  const enrollmentOverlay = document.querySelector(".container-enrollment");

  // ---------------------------------------------------------
  // 3. SPECIFIC SUB-ELEMENTS
  // ---------------------------------------------------------
  
  // A. Request Overlay Internals
  const backBtnRequest = requestOverlay.querySelector("#back-btn-1");
  const requestProceedBtn = requestOverlay.querySelector(".proceed-btn");
  const requestCheckboxContainer = requestOverlay.querySelector(".preview-text");

  const enrollmentCheckboxContainer = enrollmentOverlay.querySelector(".preview-text");
  const enrollmentProceedBtn = enrollmentOverlay.querySelector(".proceed-btn");

  // B. Claiming Overlay Internals
  const backBtnClaiming = claimingOverlay.querySelector("#back-btn-1");
  const claimingProceedBtn = claimingOverlay.querySelector(".proceed-btn");
  const claimingCheckboxContainer = claimingOverlay.querySelector(".preview-text");

  // C. Enrollment & Details Internals
  const backBtnEnrollment = enrollmentOverlay.querySelector("#back-btn-1");
  // Note: Details overlay usually handles the dynamic FAQ steps
  const detailsProceedBtn = detailsOverlay.querySelector(".proceed-btn");
  const detailsCheckboxContainer = detailsOverlay.querySelector(".preview-text");
  const backBtnDetails = detailsOverlay.querySelector("#back-btn-1");

  let kioskData = [];
  let recognition;
  let voiceMatched = false; 
  let transcriptBuffer = "";
  let faqAliases = [];
  let isPriority = false;
  let isReading = false; // Moved here from bottom
  let currentUtterance = null; // Moved here from bottom

  // ---------------------------------------------------------
  // 4. LOGIC FUNCTIONS
  // ---------------------------------------------------------

  // Logic: Only enable button if > 0 checkboxes are checked
  function setupCheckboxValidation(container, button, requireAll = false) {
  if (!container || !button) return;

  // Disable button by default
  button.disabled = true;

  container.addEventListener("change", () => {
    const checkboxes = container.querySelectorAll(".inp-cbx");
    const checked = container.querySelectorAll(".inp-cbx:checked");

    if (requireAll) {
      // Enable only if ALL checkboxes are checked
      button.disabled = checkboxes.length === 0 || checked.length !== checkboxes.length;
    } else {
      // Enable if at least one is checked
      button.disabled = !(checked.length > 0);
    }
  });
}

  function resetFormState(container, proceedButton) {
  if (!container || !proceedButton) return;

  // 1. Uncheck all checkboxes
  const checkboxes = container.querySelectorAll('.inp-cbx');
  checkboxes.forEach(cb => cb.checked = false);

  // 2. Disable the proceed button again
  proceedButton.disabled = true;
}

  // Logic: Hide current overlay -> Show Priority Overlay
  function setupProceedFlow(currentOverlay, proceedButton) {
    if (!currentOverlay || !proceedButton) return;

    proceedButton.addEventListener("click", (e) => {
      e.preventDefault();
      
      // 1. Hide the current container
      currentOverlay.classList.remove("is-visible");
      
      // 2. Show the Priority Check (Container-3)
      priorityOverlay.classList.add("is-visible");
      
      // 3. Ensure backdrop is on
      backdrop.classList.add("is-visible");
      
      stopReading();
    });
  }

  // Logic: Stop Text-to-Speech
  function stopReading() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      isReading = false;
      if(readBtn) {
        readBtn.classList.remove("active");
        readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
      }
    }
  }

  function getMaleVoice() {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    return (
      voices.find(v => v.lang.startsWith("en") && /male|man|david|mark|michael/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("en"))
    );
  }

  // Helper: Collect all checked documents from a container
  function getCheckedDocuments(container) {
      if (!container) return [];
      return [...container.querySelectorAll('.inp-cbx:checked')]
          .map(cb => {
              const p = cb.closest('.checkbox-wrapper-4')?.querySelector('.checkbox-content');
              return p ? p.textContent.trim() : '';
          })
          .filter(Boolean);
  }


  function validateFormInputs() {
    finishBtn.disabled = !(firstNameInput.value.trim() && lastNameInput.value.trim());
  }

  

  // ---------------------------------------------------------
  // 5. APPLY LOGIC & EVENT LISTENERS
  // ---------------------------------------------------------

  // A. Apply Validation (At least 1 checkbox) - ENSURE ALL BUTTONS START DISABLED
  if (requestCheckboxContainer && requestProceedBtn) {
      setupCheckboxValidation(requestCheckboxContainer, requestProceedBtn);
  }
  if (claimingCheckboxContainer && claimingProceedBtn) {
      setupCheckboxValidation(claimingCheckboxContainer, claimingProceedBtn);
  }
  // if (detailsCheckboxContainer && detailsProceedBtn) {
  //     setupCheckboxValidation(detailsCheckboxContainer, detailsProceedBtn);
  // }

  // B. Apply Flow (Proceed -> Priority)
  setupProceedFlow(requestOverlay, requestProceedBtn);
  setupProceedFlow(claimingOverlay, claimingProceedBtn);
  setupProceedFlow(enrollmentOverlay, enrollmentProceedBtn);
  if (detailsOverlay && detailsProceedBtn) {
      setupProceedFlow(detailsOverlay, detailsProceedBtn);
  }

  // C. Main Menu Button Clicks (Open Overlays)

requestBtn.addEventListener("click", () => {
  activeFlow = "request";
  requestOverlay.classList.add("is-visible");
  backdrop.classList.add("is-visible");
});

claimingBtn.addEventListener("click", () => {
  activeFlow = "claiming";
  claimingOverlay.classList.add("is-visible");
  backdrop.classList.add("is-visible");
});

enrollmentBtn.addEventListener("click", async () => {
  activeFlow = "enrollment";
  enrollmentOverlay.classList.add("is-visible");
  backdrop.classList.add("is-visible");
  await loadEnrollmentFAQs();
});


  // if (requestBtn) {
  //     requestBtn.addEventListener("click", () => {
  //         requestOverlay.classList.add("is-visible");
  //         backdrop.classList.add("is-visible");
  //     });
  // }

  // if (claimingBtn) {
  //     claimingBtn.addEventListener("click", () => {
  //         claimingOverlay.classList.add("is-visible");
  //         backdrop.classList.add("is-visible");
  //     });
  // }

  // if (enrollmentBtn) {
  //     enrollmentBtn.addEventListener("click", () => {
  //         enrollmentOverlay.classList.add("is-visible");
  //         backdrop.classList.add("is-visible");
  //     });
  // }

  // D. Back Button Clicks (Close Specific Overlays & Reset)
  if (backBtnRequest) {
      backBtnRequest.addEventListener("click", (e) => {
          e.preventDefault();
          resetFormState(requestCheckboxContainer, requestProceedBtn);
          requestOverlay.classList.remove("is-visible");
          backdrop.classList.remove("is-visible");
          stopReading();
      });
  }

  if (backBtnClaiming) {
      backBtnClaiming.addEventListener("click", (e) => {
          e.preventDefault();
          resetFormState(claimingCheckboxContainer, claimingProceedBtn);
          claimingOverlay.classList.remove("is-visible");
          backdrop.classList.remove("is-visible");
          stopReading();
      });
  }

  if (backBtnEnrollment) {
      backBtnEnrollment.addEventListener("click", (e) => {
          e.preventDefault();
          resetFormState(enrollmentCheckboxContainer, enrollmentProceedBtn);
          enrollmentOverlay.classList.remove("is-visible");
          backdrop.classList.remove("is-visible");
          stopReading();
      });
  }

  if (backBtnDetails) {
  backBtnDetails.addEventListener("click", (e) => {
    e.preventDefault();

    resetFormState(detailsCheckboxContainer, detailsProceedBtn);

    // 🔥 HARD CLOSE EVERYTHING FIRST
    detailsOverlay.classList.remove("is-visible");
    requestOverlay.classList.remove("is-visible");
    claimingOverlay.classList.remove("is-visible");
    priorityOverlay.classList.remove("is-visible");
    formOverlay.classList.remove("is-visible");
    overlayNumber.classList.remove("is-visible");

    // ✅ GO BACK ONLY TO ENROLLMENT
    enrollmentOverlay.classList.add("is-visible");

    backdrop.classList.add("is-visible");
    stopReading();
  });
}



  // E. Form Back Button
  if (backBtn2) {
      backBtn2.addEventListener("click", (e) => {
          e.preventDefault();
          formOverlay.classList.remove("is-visible");
          if(firstNameInput) firstNameInput.value = "";
          if(lastNameInput) lastNameInput.value = "";
          priorityOverlay.classList.add("is-visible");
      });
  }

  // F. Input Validation Listener
  if (firstNameInput) firstNameInput.addEventListener("input", validateFormInputs);
  if (lastNameInput) lastNameInput.addEventListener("input", validateFormInputs);

  // // E. Priority & Form Logic
  // const handlePriorityClick = (isPriorityUser) => {
  //     isPriority = isPriorityUser; 
  //     priorityOverlay.classList.remove("is-visible");
  //     formOverlay.classList.add("is-visible");
  // };
  
  // yesBtn.addEventListener("click", () => handlePriorityClick(true));
  // noBtn.addEventListener("click", () => handlePriorityClick(false));

  backBtn3.addEventListener("click", (e) => {
    e.preventDefault();
    priorityOverlay.classList.remove("is-visible");
    // Logic: Where to go back to? It's hard to track previous state simply.
    // For now, close everything or go to home.
    backdrop.classList.remove("is-visible");
  });

  // backBtn2.addEventListener("click", (e) => {
  //   e.preventDefault();
  //   formOverlay.classList.remove("is-visible");
  //   firstNameInput.value = lastNameInput.value = "";
  //   priorityOverlay.classList.add("is-visible"); 
  // });

  // firstNameInput.addEventListener("input", validateFormInputs);
  // lastNameInput.addEventListener("input", validateFormInputs);

function collectDocumentsFromContainer(container) {
    if (!container) return [];
    return [...container.querySelectorAll('.inp-cbx:checked')]
        .map(cb => cb.closest('.checkbox-wrapper-4')?.querySelector('.checkbox-content')?.textContent.trim())
        .filter(Boolean);
}

finishBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  if (finishBtn.disabled) return;
  finishBtn.disabled = true;

  const fullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;
  if (!fullName.trim()) {
    alert("Please enter your complete name.");
    finishBtn.disabled = false;
    return;
  }

  // Collect checked documents
  const allDocuments = [
    ...collectDocumentsFromContainer(requestCheckboxContainer),
    ...collectDocumentsFromContainer(enrollmentCheckboxContainer),
    ...collectDocumentsFromContainer(claimingCheckboxContainer),
    ...collectDocumentsFromContainer(detailsCheckboxContainer)
  ];

  if (!allDocuments.length) {
    alert("Please check at least one document.");
    finishBtn.disabled = false;
    return;
  }

  const uniqueDocuments = [...new Set(allDocuments)];
  const documentsText = uniqueDocuments.join(", ");

  try {
    // Call your API instead of direct insert
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        is_priority: isPriority,
        documents: documentsText
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to save queue");

    const queueNumber = result.data[0].queue_no;

    numberPreview.textContent = queueNumber;

    // Reset all overlays after successful transaction
    resetFormState(requestCheckboxContainer, requestProceedBtn);
    resetFormState(claimingCheckboxContainer, claimingProceedBtn);
    resetFormState(enrollmentCheckboxContainer, enrollmentProceedBtn);
    resetFormState(detailsCheckboxContainer, detailsProceedBtn); // if details container exists

    formOverlay.classList.remove("is-visible");
    overlayNumber.classList.add("is-visible");

    firstNameInput.value = lastNameInput.value = "";

    // Optional: print queue ticket
const printContent = `
===============================
   University of Rizal System
         Queue Ticket
===============================

Name: ${fullName}
Queue No: ${queueNumber}

Documents:
${documentsText.split(", ").map(doc => " - " + doc).join("\n")}

Please wait for your turn.
      Thank you!

-------------------------------
Printed via REIGI Kiosk
`;
window.location.href = `rawbt:printText:${encodeURIComponent(printContent)}`;
  } catch (err) {
    console.error("❌ Error saving queue:", err);
    alert("Something went wrong while saving your queue. Please try again.");
    finishBtn.disabled = false;
  }
});


  finishBtnNum.addEventListener("click", () => {
    overlayNumber.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    window.location.reload();
  });

  // ---------------------------------------------------------
  // 6. VOICE RECOGNITION SETUP
  // ---------------------------------------------------------

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Voice recognition started");
      document.querySelector(".voice-title").textContent = "Listening...";
      document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
    };

    recognition.onerror = (event) => {
      console.error("❌ Voice recognition error:", event.error);
      document.querySelector(".voice-title").textContent = "Error listening";
      document.querySelector(".voice-subtitle").textContent = "Please try again.";
    };

    recognition.onend = () => {
      console.log("🎤 Voice recognition ended");

      if (!voiceMatched) {
        const voiceTitleEl = document.querySelector(".voice-title");
        voiceTitleEl.innerHTML = `Didn't hear you :( <a href="#" class="voice-retry">Retry</a>`;
        document.querySelector(".voice-subtitle").textContent = "Please try again.";

        const retryButton = voiceTitleEl.querySelector(".voice-retry");
        retryButton.replaceWith(retryButton.cloneNode(true));
        const newRetry = voiceTitleEl.querySelector(".voice-retry");

        newRetry.addEventListener("click", (e) => {
          e.preventDefault();
          voiceMatched = false;
          voiceTitleEl.textContent = "Listening...";
          document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
          try {
            recognition.start();
          } catch (err) {
            console.warn("Voice recognition already started", err);
          }
        });
      }
    };

  recognition.onresult = (event) => {
  let transcript = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }
  transcript = transcript.toLowerCase().trim();
  document.querySelector(".voice-subtitle").textContent = transcript;

  let matchedFAQ = null;
  for (let item of faqAliases) {
    for (let kw of item.keywords) {
      if (transcript === kw || transcript.includes(` ${kw} `) || transcript.startsWith(`${kw} `) || transcript.endsWith(` ${kw}`)) {
        matchedFAQ = item.faq;
        break;
      }
      if (transcript.includes(kw)) {
        matchedFAQ = item.faq;
        break;
      }
    }
    if (matchedFAQ) break;
  }

  if (matchedFAQ && !voiceMatched) {
    voiceMatched = true;
    recognition.stop();

    document.querySelector(".voice-title").textContent = "Recognized!";
    document.querySelector(".voice-subtitle").textContent = matchedFAQ.question_title;

    setTimeout(() => {
      closeVoiceOverlay();
      openFAQDetails(matchedFAQ);
    }, 400);
  }
  };

    window.testVoiceInput = (testText) => {
      const transcript = testText.toLowerCase().trim();
      console.log("🎙️ [Test] Transcript:", transcript);

      const matched = kioskData.find(faq =>
        transcript.includes(faq.question_title.toLowerCase()) ||
        faq.question_title.toLowerCase().includes(transcript)
      );

      if (matched) {
        console.log("✅ [Test] Matched FAQ:", matched.question_title);
        document.querySelector(".voice-title").textContent = "Recognized!";
        document.querySelector(".voice-subtitle").textContent = matched.question_title;

        setTimeout(() => {
          document.querySelector(".voice-search-overlay").classList.remove("is-visible");
          document.getElementById("voice-overlay-backdrop").classList.remove("is-visible");
          openFAQDetails(matched);
        }, 1000);
      } else {
        console.log("❌ [Test] No match found for:", transcript);
        document.querySelector(".voice-title").textContent = "No match found";
        document.querySelector(".voice-subtitle").textContent = transcript;
      }
    };
  }

  voiceBtn.addEventListener("click", () => {
    voiceOverlay.classList.add("is-visible");
    voiceBackdrop.classList.add("is-visible");
    document.querySelector(".voice-title").textContent = "Listening...";
    document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
    try {
      recognition.start();
    } catch (err) {
      console.warn("Voice recognition already started", err);
    }
  });

  function closeVoiceOverlay() {
    if (recognition) recognition.stop();
    voiceMatched = false;
    transcriptBuffer = "";
    document.querySelector(".voice-title").textContent = "Listening...";
    document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
    voiceOverlay.classList.remove("is-visible");
    voiceBackdrop.classList.remove("is-visible");
  }

  voiceBackBtn.addEventListener("click", (e) => { e.preventDefault(); closeVoiceOverlay(); });
  voiceCancelBtn.addEventListener("click", closeVoiceOverlay);
  voiceBackdrop.addEventListener("click", closeVoiceOverlay);

  // ---------------------------------------------------------
  // 7. READ ALOUD SETUP
  // ---------------------------------------------------------

  if (readBtn) {
    readBtn.addEventListener("click", () => {
      const synth = window.speechSynthesis;

      if (isReading) {
        synth.cancel();
        isReading = false;
        readBtn.classList.remove("active");
        readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
        return;
      }

      synth.cancel();

      let text = `Process for ${faqName.textContent.trim()}. `;
      const reqs = [...requirementsList.querySelectorAll("li")].map(li => li.textContent.trim());
      text += reqs.length ? `Here are the requirements: ${reqs.join(", ")}. ` : "No requirements listed. ";
      const steps = [...stepsContainer.querySelectorAll(".checkbox-content")].map(p => p.textContent.trim());
      text += steps.length ? `Now, follow these steps: ${steps.join(". ")}.` : "No steps available.";

      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.rate = 1;
      currentUtterance.pitch = 1;
      currentUtterance.lang = "en-US";
      currentUtterance.voice = getMaleVoice();

      currentUtterance.onstart = () => {
        isReading = true;
        readBtn.classList.add("active");
        readBtn.innerHTML = `<i class="ph ph-speaker-slash"></i> Stop Reading`;
      };

      currentUtterance.onend = () => {
        isReading = false;
        readBtn.classList.remove("active");
        readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
      };

      synth.speak(currentUtterance);
    });

  }

  async function loadEnrollmentFAQs() {
  try {
    const { data, error } = await supabaseClient
      .from("kiosk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Clear the container first
    if (enrollmentFaqContainer) enrollmentFaqContainer.innerHTML = "";

    // Create buttons for each kiosk FAQ
    data.forEach(faq => {
      const btn = document.createElement("div");
      btn.classList.add("faq-option");
      btn.dataset.id = faq.id;
      btn.innerHTML = `<i class="ph ph-magnifying-glass"></i><span class="faq-option-name">${faq.question_title}</span>`;

      // When clicked, show details (optional)
      btn.addEventListener("click", () => openFAQDetails(faq));

      enrollmentFaqContainer.appendChild(btn);
    });
  } catch (err) {
    console.error("❌ Error loading enrollment FAQs:", err.message);
  }
}

// if (enrollmentBtn) {
//   enrollmentBtn.addEventListener("click", async () => {
//     // Show overlay
//     enrollmentOverlay.classList.add("is-visible");
//     backdrop.classList.add("is-visible");

//     // Load the kiosk buttons inside enrollment overlay
//     await loadEnrollmentFAQs();
//   });
// }



  // ---------------------------------------------------------
  // 8. DATA LOADING
  // ---------------------------------------------------------
    
   async function loadFAQs() {
    const { data, error } = await supabaseClient
      .from("kiosk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error loading FAQs:", error);
      return;
    }

    kioskData = data;

    // 1. Clear BOTH containers safely
    if (mainFaqContainer) mainFaqContainer.innerHTML = "";
    if (enrollmentFaqContainer) enrollmentFaqContainer.innerHTML = "";

    // 2. Loop through data and append to BOTH
    data.forEach(faq => {
      // -- Create for MAIN Screen --
      if (mainFaqContainer) {
        const option1 = document.createElement("div");
        option1.classList.add("faq-option");
        option1.dataset.id = faq.id;
        option1.innerHTML = `<i class="ph ph-magnifying-glass"></i><span class="faq-option-name">${faq.question_title}</span>`;
        mainFaqContainer.appendChild(option1);
      }

      // -- Create for ENROLLMENT Overlay --
      if (enrollmentFaqContainer) {
        const option2 = document.createElement("div");
        option2.classList.add("faq-option");
        option2.dataset.id = faq.id;
        option2.innerHTML = `<i class="ph ph-magnifying-glass"></i><span class="faq-option-name">${faq.question_title}</span>`;
        enrollmentFaqContainer.appendChild(option2);
      }
    });

    // 3. Re-attach handlers to all newly created buttons
    attachFAQClickHandlers(data);

    faqAliases = kioskData.map(faq => {
        const rawTitle = faq.question_title;
        const lowerTitle = rawTitle.toLowerCase();
        const cleanWords = lowerTitle.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 0);
        const existingAcronyms = rawTitle.match(/\b[A-Z]{2,}\b/) || [];
        const generatedAcronym = cleanWords.map(word => word[0]).join(""); 
        const keywords = [
            lowerTitle,                    
            ...cleanWords,                 
            ...existingAcronyms.map(a => a.toLowerCase()), 
            generatedAcronym              
        ];

        const uniqueKeywords = [...new Set(keywords)];

        return { faq, keywords: uniqueKeywords };
    });
  }

  function attachFAQClickHandlers(data) {
    // This finds .faq-option in main container AND in enrollment container
    const allOptions = document.querySelectorAll(".faq-option");
    
    allOptions.forEach(option => {
      option.addEventListener("click", () => {
        const selected = data.find(f => f.id == option.dataset.id);
        if (selected) openFAQDetails(selected);
      });
    });
}

  function openFAQDetails(selected) {
    activeFlow = "details";

    // Close ALL overlays first
    requestOverlay.classList.remove("is-visible");
    claimingOverlay.classList.remove("is-visible");
    enrollmentOverlay.classList.remove("is-visible");
    priorityOverlay.classList.remove("is-visible");
    formOverlay.classList.remove("is-visible");
    overlayNumber.classList.remove("is-visible");
    
    overlay.classList.add("is-visible");
    backdrop.classList.add("is-visible");
    faqName.textContent = selected.question_title;

    detailsOverlay.classList.add("is-visible"); // Show the details overlay
    backdrop.classList.add("is-visible");

    // --- Requirements List ---
    requirementsList.innerHTML = "";
    (JSON.parse(selected.requirements || "[]")).forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        requirementsList.appendChild(li);
    });

    // --- Steps with Checkboxes ---
    stepsContainer.innerHTML = "";
    (JSON.parse(selected.steps || "[]")).forEach((step, i) => {
        const cbxId = `step-${selected.id}-${i}`;
        stepsContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="checkbox-wrapper-4 mb-3">
              <input class="inp-cbx" id="${cbxId}" type="checkbox"/>
              <label class="cbx" for="${cbxId}">
                <span><svg width="12px" height="10px"><use xlink:href="#check-4"></use></svg></span>
              </label>
              <svg class="inline-svg">
                <symbol id="check-4" viewBox="0 0 12 10">
                  <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </symbol>
              </svg>
              <p class="checkbox-content">${step}</p>
            </div>`
        );
    });

    // --- Proceed Button Logic ---
    const currentProceedBtn = detailsOverlay.querySelector(".proceed-btn");

    // Disable button by default
    currentProceedBtn.disabled = true;

    // Determine if we require ALL checkboxes (from enrollment flow)
    const requireAllSteps = activeFlow === "enrollment";

    // Remove old listeners and set up fresh validation
    const newDetailsCheckboxContainer = detailsCheckboxContainer.cloneNode(true);
    detailsCheckboxContainer.parentNode.replaceChild(newDetailsCheckboxContainer, detailsCheckboxContainer);
    
    // Re-query after replacing
    const updatedCheckboxContainer = detailsOverlay.querySelector(".preview-text");

    updatedCheckboxContainer.addEventListener("change", () => {
      const allCheckboxes = updatedCheckboxContainer.querySelectorAll(".inp-cbx");
      const checkedCheckboxes = updatedCheckboxContainer.querySelectorAll(".inp-cbx:checked");

      if (requireAllSteps) {
        // For enrollment: require ALL checkboxes checked
        currentProceedBtn.disabled = allCheckboxes.length === 0 || checkedCheckboxes.length !== allCheckboxes.length;
      } else {
        // For details: require at least ONE checkbox checked
        currentProceedBtn.disabled = !(checkedCheckboxes.length > 0);
      }
    });

  //   detailsCheckboxContainer.onchange = (e) => {
  //   if (e.target.classList.contains("inp-cbx")) {
  //     const checked = detailsCheckboxContainer.querySelectorAll(".inp-cbx:checked");
  //     detailsProceedBtn.disabled = !(checked.length > 0);
  //   }
  // };


    // --- Image Preview ---
    previewImage.classList.remove("loaded");
    previewImage.style.display = "none";
    previewImage.src = "";

    if (selected.image_url) {
        const imgLoader = new Image();
        const timestampedUrl = `${selected.image_url}?t=${Date.now()}`;
        imgLoader.src = timestampedUrl;

        imgLoader.onload = () => {
            previewImage.src = timestampedUrl;
            previewImage.style.display = "block";
            requestAnimationFrame(() => previewImage.classList.add("loaded"));
        };

        imgLoader.onerror = () => {
            console.error("Failed to load image:", selected.image_url);
            previewImage.style.display = "none";
        };
    }

    // --- Proceed Button Click ---
    currentProceedBtn.onclick = (e) => {
        e.preventDefault();
        detailsOverlay.classList.remove("is-visible");
        priorityOverlay.classList.add("is-visible");
        backdrop.classList.add("is-visible");
        stopReading();
    };
}

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    
    // Only clear the MAIN container, enrollment usually doesn't need search filtering
    if (mainFaqContainer) mainFaqContainer.innerHTML = "";

    if (!query) {
      // Restore all if empty
      loadFAQs(); 
      return;
    }

    const matches = kioskData.filter(faq =>
      faq.question_title.toLowerCase().includes(query)
    );

    matches.forEach(faq => {
      const option = document.createElement("div");
      option.classList.add("faq-option");
      option.innerHTML = `
        <i class="ph ph-magnifying-glass"></i>
        <span class="faq-option-name">${faq.question_title}</span>
      `;
      option.addEventListener("click", () => openFAQDetails(faq));
      
      if (mainFaqContainer) mainFaqContainer.appendChild(option);
    });
  });

  searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  faqOptionContainer.innerHTML = "";

  loadFAQs();

  supabaseClient
    .channel("realtime-kiosk-app")
    .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async () => {
      console.log("🔄 Kiosk data changed");
      await loadFAQs();
    })
    .subscribe();
  });

  // ==========================================
  // FINAL PRIORITY BUTTON LOGIC FIX
  // ==========================================
  
  // 1. Define the Transition Function
  const runPriorityTransition = (isPriorityUser) => {
  isPriority = isPriorityUser;

  // HIDE EVERYTHING BELOW
  priorityOverlay.classList.remove("is-visible");
  requestOverlay.classList.remove("is-visible");
  claimingOverlay.classList.remove("is-visible");
  enrollmentOverlay.classList.remove("is-visible");
  detailsOverlay.classList.remove("is-visible");

  // SHOW FORM
  formOverlay.classList.add("is-visible");

  // KEEP BACKDROP
  backdrop.classList.add("is-visible");
};

yesBtn.onclick = (e) => {
  e.preventDefault();
  runPriorityTransition(true);
};

noBtn.onclick = (e) => {
  e.preventDefault();
  runPriorityTransition(false);
};
});
//   const runPriorityTransition = (isPriorityUser) => {
//       console.log("👉 Transition Triggered. Priority:", isPriorityUser);
//       isPriority = isPriorityUser;

//       // HIDE Priority Overlay
//       if (priorityOverlay) {
//           priorityOverlay.classList.remove("is-visible");
//       }

//       // SHOW Form Overlay (with slight delay for CSS handling)
//       if (formOverlay) {
//           setTimeout(() => {
//               formOverlay.classList.add("is-visible");
//           }, 10);
//       }

//       // ENSURE Backdrop is on
//       if (backdrop) {
//           backdrop.classList.add("is-visible");
//       }
//   };

//   // 2. Attach Listeners (using onclick to override any potential duplicates)
//   const safeYesBtn = document.getElementById("yes-btn");
//   const safeNoBtn = document.getElementById("no-btn");

//   if (safeYesBtn) {
//       safeYesBtn.onclick = (e) => {
//           e.preventDefault();
//           runPriorityTransition(true);
//       };
//       console.log("✅ YES button listener active.");
//   } else {
//       console.error("❌ YES button missing.");
//   }

//   if (safeNoBtn) {
//       safeNoBtn.onclick = (e) => {
//           e.preventDefault();
//           runPriorityTransition(false);
//       };
//       console.log("✅ NO button listener active.");
//   } else {
//       console.error("❌ NO button missing.");
//   }

// });
