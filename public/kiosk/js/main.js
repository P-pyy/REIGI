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
  const readButtons = document.querySelectorAll(".speak-btn i.ph-user-sound, .speak-btn:has(.ph-user-sound)");

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
  const selectAllBtn = detailsOverlay.querySelector(".select-all-btn");

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

  function toggleReadAloud(button) {
    const synth = window.speechSynthesis;

    if (isReading) {
        synth.cancel();
        isReading = false;
        button.classList.remove("active");
        button.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
        return;
    }

    synth.cancel();

    // Determine what text to read based on the active overlay
    // This logic needs to be dynamic based on which button was clicked
    let text = "";
    
    // Find the parent container of the clicked button
    const container = button.closest('.container-overlay');
    
    if (container) {
        // Try to find title and steps within this specific container
        const title = container.querySelector('.title-preview')?.textContent || 
                      container.querySelector('.faq-name')?.textContent || "Information";
        
        text += `Process for ${title.trim()}. `;

        // Add requirements if present
        const reqList = container.querySelector(".faq-preview ol");
        if (reqList) {
             const reqs = [...reqList.querySelectorAll("li")].map(li => li.textContent.trim());
             text += reqs.length ? `Here are the requirements: ${reqs.join(", ")}. ` : "";
        }

        // Add steps/checkboxes if present
        const stepContainer = container.querySelector(".preview-text");
        if (stepContainer) {
             const steps = [...stepContainer.querySelectorAll(".checkbox-content")].map(p => p.textContent.trim());
             text += steps.length ? `Follow these steps: ${steps.join(". ")}.` : "";
        }
    }

    if (!text) text = "No content found to read.";

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 1;
    currentUtterance.pitch = 1;
    currentUtterance.lang = "en-US";
    currentUtterance.voice = getMaleVoice();

    currentUtterance.onstart = () => {
        isReading = true;
        button.classList.add("active");
        button.innerHTML = `<i class="ph ph-speaker-slash"></i> Stop Reading`;
    };

    currentUtterance.onend = () => {
        isReading = false;
        button.classList.remove("active");
        button.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
    };

    synth.speak(currentUtterance);
  }

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

    // 3. Reset "Select All" button text (if it exists nearby)
    // We traverse up to the card, then look for the button
    const card = container.closest('.faq-preview-card');
    if (card) {
        const selectAllText = card.querySelector('.select-all-btn .speak-btn-text');
        if (selectAllText) {
            selectAllText.textContent = "Select All";
        }
    }
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
        
        // Reset ALL read buttons visual state
        document.querySelectorAll(".navigation-head-container .speak-btn").forEach(btn => {
            btn.classList.remove("active");
            btn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
        });
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

if (enrollmentBtn) {
      enrollmentBtn.addEventListener("click", async () => {
          activeFlow = "enrollment"; // <--- Set this flag!
          enrollmentOverlay.classList.add("is-visible");
          backdrop.classList.add("is-visible");
          await loadFAQs(); // Or loadEnrollmentFAQs if you have a specific one
      });
  }


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
          
          enrollmentOverlay.classList.remove("is-visible");
          backdrop.classList.remove("is-visible");
          stopReading();
      });
  }

  if (backBtnDetails) {
      backBtnDetails.addEventListener("click", (e) => {
          e.preventDefault();
          
          resetFormState(detailsCheckboxContainer, detailsProceedBtn);

          // 1. Always close Details
          detailsOverlay.classList.remove("is-visible");

          // 2. Where to go?
          if (activeFlow === "enrollment") {
              // If we came from Enrollment, show Enrollment Menu again
              enrollmentOverlay.classList.add("is-visible");
              // Keep backdrop visible
          } else {
              // If we came from Search ("request" or "search"), go Home
              requestOverlay.classList.remove("is-visible"); // Ensure request is closed
              backdrop.classList.remove("is-visible");
          }
          
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

    let transactionType = "General Inquiry";

    if (activeFlow === "request") {
      transactionType = "Requesting Documents";
    } else if (activeFlow === "claiming") {
      transactionType = "Claiming Documents";
    } else if (activeFlow === "enrollment") {
      transactionType = "Enrollment";
    } else if (activeFlow === "search") {
      transactionType = "Information / Inquiry";
    }

    // Optional: print queue ticket
const printContent = `
===============================
   University of Rizal System
         Queue Ticket
===============================

Transaction: ${transactionType}

Name: ${fullName}
Queue No: ${queueNumber}

Documents:
${documentsText.split(", ").map(doc => " - " + doc).join("\n")}

Please wait for your turn.
      Thank you!

-------------------------------
Printed via REIGI Kiosk
`;
// const printContent = `
// ===============================
//    University of Rizal System
//          Queue Ticket
// ===============================

// Name: ${fullName}
// Queue No: ${queueNumber}

// Documents:
// ${documentsText.split(", ").map(doc => " - " + doc).join("\n")}

// Please wait for your turn.
//       Thank you!

// -------------------------------
// Printed via REIGI Kiosk
// `;
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

  let voiceDebounceTimer = null; // NEW: Timer for debouncing

  // Helper to show "Not Found" or "Silence" UI
  function showRetryUI(titleMessage) {
      const voiceTitleEl = document.querySelector(".voice-title");
      voiceTitleEl.innerHTML = `${titleMessage} <a href="#" class="voice-retry" style="color: #ffeb3b; text-decoration: underline; cursor: pointer; margin-left: 10px;">Retry</a>`;
      
      setTimeout(() => {
          const retryButton = document.querySelector(".voice-retry");
          if (retryButton) {
              retryButton.addEventListener("click", (e) => {
                  e.preventDefault();
                  voiceMatched = false;
                  transcriptBuffer = ""; // Reset buffer
                  clearTimeout(voiceDebounceTimer); // Clear any hanging timers
                  document.querySelector(".voice-title").textContent = "Listening...";
                  document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
                  try {
                      recognition.start();
                  } catch (err) {
                      console.warn("Voice recognition already started", err);
                  }
              });
          }
      }, 50);
  }

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

    // NEW LOGIC: Evaluation Engine (Hierarchical Search)
    function evaluateVoiceCommand(transcript) {
        if (!transcript || voiceMatched) return;

        let matchedFAQ = null;
        let matchedExecute = null;
        let matchedText = "";

        // ==========================================
        // TIER 1: ENROLLMENT FAQs ONLY
        // ==========================================
        // Filter the existing aliases to only those inside the enrollment container
        const enrollmentOptions = Array.from(enrollmentFaqContainer.querySelectorAll('.faq-option'));
        const enrollmentIds = enrollmentOptions.map(opt => opt.dataset.id);

        for (let item of faqAliases) {
            // Check if this FAQ belongs to the Enrollment list
            if (enrollmentIds.includes(item.faq.id.toString())) {
                for (let kw of item.keywords) {
                    if (transcript === kw || transcript.includes(` ${kw} `) || transcript.startsWith(`${kw} `) || transcript.endsWith(` ${kw}`)) {
                        matchedFAQ = item.faq;
                        matchedText = item.faq.question_title;
                        matchedExecute = () => openFAQDetails(item.faq);
                        break;
                    }
                }
            }
            if (matchedExecute) break;
        }

        // ==========================================
        // TIER 2: REQUEST & CLAIMING CHECKBOXES
        // ==========================================
        if (!matchedExecute) {
            const checkboxes = document.querySelectorAll('.container-request .checkbox-content, .container-claiming .checkbox-content');
            for (let cb of checkboxes) {
                const cbText = cb.textContent.toLowerCase().trim();
                
                if (transcript.includes(cbText) || (transcript.length > 3 && cbText.includes(transcript))) {
                    const parentBtn = cb.closest('.container-request') ? requestBtn : claimingBtn;
                    matchedText = cbText;
                    matchedExecute = () => {
                        parentBtn.click(); // Open Request or Claiming container
                        cb.innerHTML = cb.innerHTML.replace(new RegExp(`(${transcript})`, 'gi'), `<mark>$1</mark>`);
                    };
                    break;
                }
            }
        }

        // ==========================================
        // FINAL EXECUTION OR REJECTION
        // ==========================================
        if (matchedExecute) {
            voiceMatched = true;
            recognition.stop();
            document.querySelector(".voice-title").textContent = "Recognized!";
            
            // Highlight safely
            try {
                const safeRegex = matchedText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                const safeHighlight = transcript.replace(new RegExp(`(${safeRegex})`, 'gi'), `<mark>$1</mark>`);
                document.querySelector(".voice-subtitle").innerHTML = safeHighlight || `<mark>${transcript}</mark>`;
            } catch(e) {
                document.querySelector(".voice-subtitle").innerHTML = `<mark>${transcript}</mark>`;
            }

            // Execute the matched routing
            setTimeout(() => {
                closeVoiceOverlay();
                matchedExecute();
            }, 1200);

        } else {
            // ASAP REJECTION: Trigger immediately when eval fails all tiers
            voiceMatched = true; 
            recognition.stop();
            showRetryUI("Couldn't find it.");
            document.querySelector(".voice-subtitle").innerHTML = `No match for: "<span style="color: #ff5252">${transcript}</span>"`;
        }
    }

    recognition.onend = () => {
      console.log("🎤 Voice recognition ended");
      clearTimeout(voiceDebounceTimer); // Stop the debounce

      if (!voiceMatched) {
        if (transcriptBuffer.trim() === "") {
            // User opened it but stayed totally silent
            showRetryUI("Didn't hear you :(");
            document.querySelector(".voice-subtitle").textContent = "Please try again.";
        } else {
            // NATIVE CUTOFF: If the microphone auto-stops before the 2 sec debounce finishes,
            // evaluate the text immediately (ASAP).
            evaluateVoiceCommand(transcriptBuffer);
        }
      }
    };

    recognition.onresult = (event) => {
      // Clear the debounce timer every time the user speaks a new syllable
      clearTimeout(voiceDebounceTimer); 

      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      transcriptBuffer = transcript.toLowerCase().trim();
      document.querySelector(".voice-subtitle").textContent = transcriptBuffer;

      // START DEBOUNCE: If 2 seconds pass with no new words, run the evaluation
      voiceDebounceTimer = setTimeout(() => {
          evaluateVoiceCommand(transcriptBuffer);
      }, 500);
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
    clearTimeout(voiceDebounceTimer); // Safety cleanup
    voiceMatched = false;
    transcriptBuffer = "";
    document.querySelector(".voice-title").textContent = "Listening...";
    document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
    voiceOverlay.classList.remove("is-visible");
    voiceBackdrop.classList.remove("is-visible");
  }

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
      let isFinal = false; // <-- CRITICAL FIX: Track if the sentence is finished

      for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
              isFinal = true;
          }
      }
      
      transcript = transcript.toLowerCase().trim();
      
      // Keep updating the UI live so the user sees you are listening
      document.querySelector(".voice-subtitle").textContent = transcript;

      // CRITICAL FIX: Do NOT run the search until the user stops speaking!
      if (!isFinal) return; 

      let matchedExecute = null;
      let matchedText = "";

      // ==========================================
      // SEARCH TIER 1: CUSTOM ALIASES
      // ==========================================
      const customAliases = {
          "request": requestBtn,
          "get a document": requestBtn,
          "tor": requestBtn, 
          
          "claiming": claimingBtn,
          "claim": claimingBtn,
          "pick up": claimingBtn, 
          
          "enrollment": enrollmentBtn,
          "enroll": enrollmentBtn
      };

      for (const [alias, btnEl] of Object.entries(customAliases)) {
          if (transcript.includes(alias)) {
              matchedExecute = () => btnEl.click();
              matchedText = alias;
              break;
          }
      }

      // ==========================================
      // SEARCH TIER 2: CHECKBOX LABELS (Request/Claiming)
      // ==========================================
      if (!matchedExecute) {
          const checkboxes = document.querySelectorAll('.container-request .checkbox-content, .container-claiming .checkbox-content');
          for (let cb of checkboxes) {
              const cbText = cb.textContent.toLowerCase().trim();
              
              if (transcript.includes(cbText) || (transcript.length > 3 && cbText.includes(transcript))) {
                  const parentBtn = cb.closest('.container-request') ? requestBtn : claimingBtn;
                  matchedExecute = () => {
                      parentBtn.click(); // Open the right container
                      // Highlight the specific checkbox label in the UI
                      cb.innerHTML = cb.innerHTML.replace(new RegExp(`(${transcript})`, 'gi'), `<mark>$1</mark>`);
                  };
                  matchedText = cbText;
                  break;
              }
          }
      }

      // ==========================================
      // SEARCH TIER 3: KIOSK FAQs
      // ==========================================
      if (!matchedExecute) {
          for (let item of faqAliases) {
            for (let kw of item.keywords) {
              if (transcript === kw || transcript.includes(` ${kw} `) || transcript.startsWith(`${kw} `) || transcript.endsWith(` ${kw}`)) {
                matchedExecute = () => openFAQDetails(item.faq);
                matchedText = item.faq.question_title;
                break;
              }
            }
            if (matchedExecute) break;
          }
      }

      // ==========================================
      // FINAL EXECUTION OR REJECTION
      // ==========================================
      if (matchedExecute && !voiceMatched) {
          voiceMatched = true;
          recognition.stop();

          document.querySelector(".voice-title").textContent = "Recognized!";
          
          // Highlight the keyword in the subtitle safely
          try {
              // Escape special characters so regex doesn't break on words like (SF-10)
              const safeRegex = matchedText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
              const safeHighlight = transcript.replace(new RegExp(`(${safeRegex})`, 'gi'), `<mark>$1</mark>`);
              document.querySelector(".voice-subtitle").innerHTML = safeHighlight || `<mark>${transcript}</mark>`;
          } catch(e) {
              document.querySelector(".voice-subtitle").innerHTML = `<mark>${transcript}</mark>`;
          }

          // Execute routing
          setTimeout(() => {
              closeVoiceOverlay();
              matchedExecute(); 
          }, 1200);

      } else if (!matchedExecute && !voiceMatched) {
          // Explicit "Couldn't find it" fallback
          voiceMatched = true; // Prevents onend from showing "Didn't hear you"
          recognition.stop();
          showRetryUI("Couldn't find it.");
          document.querySelector(".voice-subtitle").textContent = `No match for: "${transcript}"`;
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

  const allReadButtons = document.querySelectorAll(".navigation-head-container .speak-btn");

  allReadButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
          e.preventDefault();
          toggleReadAloud(btn);
      });
  });

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
      btn.addEventListener("click", () => {
          activeFlow = "enrollment"; // <--- ADD THIS: Remember we came from enrollment
          openFAQDetails(faq);
      });

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
    // activeFlow = "details";

    // 1. Close ALL other overlays first
    requestOverlay.classList.remove("is-visible");
    claimingOverlay.classList.remove("is-visible");
    enrollmentOverlay.classList.remove("is-visible");
    priorityOverlay.classList.remove("is-visible");
    formOverlay.classList.remove("is-visible");
    overlayNumber.classList.remove("is-visible");
    
    // 2. Show the specific overlay
    // overlay.classList.add("is-visible"); // Generic container
    backdrop.classList.add("is-visible");
    faqName.textContent = selected.question_title;

    detailsOverlay.classList.add("is-visible"); // The Details/Steps container

    // 3. Populate Requirements
    requirementsList.innerHTML = "";
    (JSON.parse(selected.requirements || "[]")).forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        requirementsList.appendChild(li);
    });

    // 4. Populate Checkboxes
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

    // 5. Setup "Proceed" Button Logic
    const currentProceedBtn = detailsOverlay.querySelector(".proceed-btn");
    currentProceedBtn.disabled = true; // Start disabled

    // 6. Setup "Select All" Button Logic
    const localSelectAllBtn = detailsOverlay.querySelector(".select-all-btn");

    if (localSelectAllBtn) {
        // Clone button to remove old event listeners (Clean slate)
        const newSelectAllBtn = localSelectAllBtn.cloneNode(true);
        localSelectAllBtn.parentNode.replaceChild(newSelectAllBtn, localSelectAllBtn);

        // Add Click Listener
        newSelectAllBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const allCheckboxes = stepsContainer.querySelectorAll(".inp-cbx");
            
            // Logic: If ANY box is unchecked, we Select All. 
            // Only if ALL are currently checked do we Unselect All.
            const isAllChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            const targetState = !isAllChecked;

            // Apply state
            allCheckboxes.forEach(cb => {
                cb.checked = targetState;
            });

            // Update Button Text
            const btnText = newSelectAllBtn.querySelector(".speak-btn-text");
            if(btnText) btnText.textContent = targetState ? "Unselect All" : "Select All";

            // CRITICAL: Manually trigger the 'change' event so the validation logic runs
            stepsContainer.dispatchEvent(new Event('change'));
        });
    }

    // 7. Validation Listener (Enables/Disables Proceed)
    // We remove old listeners by cloning or simply overwriting 'onchange'
    stepsContainer.onchange = () => {
        const checked = stepsContainer.querySelectorAll(".inp-cbx:checked");
        // Logic: Enable if at least 1 is checked
        currentProceedBtn.disabled = !(checked.length > 0);
    };

    // 8. Handle Image Loading
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
            previewImage.style.display = "none";
        };
    } else {
        previewImage.style.display = "none";
    }

    // 9. Proceed Button Click -> Go to Priority
    // Override onclick to ensure it targets the correct overlay
    currentProceedBtn.onclick = (e) => {
        e.preventDefault();
        
        // Reset the form state visually (optional, but good for cleanup)
        // resetFormState(stepsContainer, currentProceedBtn); 
        // Note: Don't reset here if you want to keep data, but reset if you want clean slate on back.

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
      option.addEventListener("click", () => {
          activeFlow = "search"; // <--- ADD THIS: Remember we came from search
          openFAQDetails(faq);
      });
      
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
