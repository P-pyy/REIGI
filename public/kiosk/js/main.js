// // Import Supabase Client
// import { supabaseClient } from '/js/supabase-client.js';


// // Main Logic
// document.addEventListener("DOMContentLoaded", async () => {
//   const faqOptionContainer = document.querySelector(".faq-option-container");
//   const overlay = document.querySelector(".container-overlay");
//   const backBtn = document.getElementById("back-btn");
//   const backdrop = document.getElementById("overlay-backdrop");
  
//   // Voice Search Elements
//   const voiceBtn = document.querySelector(".voice-btn");
//   const voiceOverlay = document.querySelector(".voice-search-overlay");
//   const voiceBackdrop = document.getElementById("voice-overlay-backdrop");
//   const voiceBackBtn = document.querySelector(".voice-back-btn");
//   const voiceCancelBtn = document.querySelector(".voice-cancel-btn");

//   // Handle Voice Search
//   voiceBtn.addEventListener("click", () => {
//   voiceOverlay.classList.add("is-visible");
//   voiceBackdrop.classList.add("is-visible");

//   document.querySelector(".voice-title").textContent = "Listening...";
//   document.querySelector(".voice-subtitle").textContent = "Speak the process name...";

//   try {
//     recognition.start();
//   } catch(err) {
//     console.warn("Voice recognition already started", err);
//   }
//   });

//   // Handle closing voice search overlay
//   function closeVoiceOverlay() {
//     voiceOverlay.classList.remove("is-visible");
//     voiceBackdrop.classList.remove("is-visible");
//   }

//   voiceBackBtn.addEventListener("click", (e) => {
//     e.preventDefault();
//     closeVoiceOverlay();
//   });

//   voiceCancelBtn.addEventListener("click", closeVoiceOverlay);
//   voiceBackdrop.addEventListener("click", closeVoiceOverlay);
//   const proceedBtn = document.getElementById("proceed-btn");
//   const formOverlay = document.querySelector(".container-overlay-form");

//   const backBtn1 = document.getElementById("back-btn-1"); 
//   const backBtn2 = document.getElementById("back-btn-2");

//   const faqName = document.querySelector(".faq-name");
//   const requirementsList = document.querySelector(".faq-preview ol");
//   const stepsContainer = document.querySelector(".preview-text");
//   const previewImage = document.querySelector(".preview-image");

//   const finishBtn = document.getElementById("finish-btn");
//   const overlayForm = document.querySelector(".container-overlay-form");
//   const overlayNumber = document.querySelector(".container-overlay-number");

//   const firstNameInput = overlayForm.querySelector('input[placeholder="First Name"]');
//   const lastNameInput = overlayForm.querySelector('input[placeholder="Last Name"]');
//   const numberPreview = document.querySelector(".number-preview");
  
//   // --- Voice Recognition Setup ---
//   let recognition;
//   if ('webkitSpeechRecognition' in window) {
//     recognition = new webkitSpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onstart = () => {
//       console.log("🎤 Voice recognition started");
//       document.querySelector(".voice-title").textContent = "Listening...";
//       document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
//     };

//     recognition.onerror = (event) => {
//       console.error("❌ Voice recognition error:", event.error);
//       document.querySelector(".voice-title").textContent = "Error listening";
//       document.querySelector(".voice-subtitle").textContent = "Please try again.";
//     };

//     recognition.onend = () => {
//       console.log("🎤 Voice recognition ended");
//       document.querySelector(".voice-title").textContent = "Stopped Listening";
//     };
//   } else {
//     console.warn("❌ Speech Recognition not supported");
//   }

//   if (recognition) {
//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript.toLowerCase().trim();
//     console.log("🎙️ Heard:", transcript);

//     // Try to find a matching question_title
//     const matched = kioskData.find(faq =>
//       transcript.includes(faq.question_title.toLowerCase()) ||
//       faq.question_title.toLowerCase().includes(transcript)
//     );

//     if (matched) {
//       console.log("✅ Matched FAQ:", matched.question_title);

//       // Update overlay UI
//       document.querySelector(".voice-title").textContent = "Recognized!";
//       document.querySelector(".voice-subtitle").textContent = matched.question_title;

//       setTimeout(() => {
//         // Close the voice overlay
//         voiceOverlay.classList.remove("is-visible");
//         voiceBackdrop.classList.remove("is-visible");

//         // Automatically open the process form overlay
//         openFAQDetails(matched);
//       }, 1000);
//     } else {
//       document.querySelector(".voice-title").textContent = "No match found";
//       document.querySelector(".voice-subtitle").textContent = "Please try again.";
//     }
//   };
// }


//   // --- 2. ADD THIS HELPER FUNCTION ---
//     // This checks all checkboxes and enables/disables the proceed button
//     function updateProceedButtonState() {
//         const allCheckboxes = stepsContainer.querySelectorAll(".inp-cbx");
//         const checkedCheckboxes = stepsContainer.querySelectorAll(".inp-cbx:checked");

//         if (allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length) {
//             proceedBtn.disabled = false; // Enable the button
//         } else {
//             proceedBtn.disabled = true; // Disable the button
//         }
//     }

//     function validateFormInputs() {
//         const firstName = firstNameInput.value.trim();
//         const lastName = lastNameInput.value.trim();

//         if (firstName !== "" && lastName !== "") {
//             finishBtn.disabled = false; // Enable the button
//         } else {
//             finishBtn.disabled = true; // Disable the button
//         }
//     }

//   let kioskData = []; // Store FAQs globally for voice search

//   // Load FAQ Data from Supabase
//   async function loadFAQs() {
//     const { data, error } = await supabaseClient
//       .from("kiosk")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("❌ Error loading FAQs:", error);
//       return;
//     }

//     kioskData = data; // save to global variable
//     faqOptionContainer.innerHTML = ""; 

//     data.forEach((faq) => {
//       const faqOption = document.createElement("div");
//       faqOption.classList.add("faq-option");
//       faqOption.dataset.id = faq.id;
//       faqOption.innerHTML = `
//         <i class="ph ph-magnifying-glass"></i>
//         <span class="faq-option-name">${faq.question_title}</span>
//       `;
//       faqOptionContainer.appendChild(faqOption);
//     });

//     attachFAQClickHandlers(data);
//   }
  

//   // Show Overlay with FAQ Details
//   function attachFAQClickHandlers(faqData) {
//     document.querySelectorAll(".faq-option").forEach((option) => {
//       option.addEventListener("click", () => {
//         const selected = faqData.find(f => f.id == option.dataset.id);
//         if (!selected) return;

//         overlay.classList.add("is-visible");
//         backdrop.classList.add("is-visible");

//         // Display FAQ Details
//         faqName.textContent = selected.question_title;

//         // Requirements
//         requirementsList.innerHTML = "";
//         const reqs = JSON.parse(selected.requirements || "[]");
//         reqs.forEach(r => {
//           const li = document.createElement("li");
//           li.textContent = r;
//           requirementsList.appendChild(li);
//         });

//         // Steps
//         stepsContainer.innerHTML = "";
//         const steps = JSON.parse(selected.steps || "[]");

//         steps.forEach((step, i) => {
//         const stepBlock = document.createElement("div");
//         stepBlock.classList.add("checkbox-wrapper-4", "mb-3");

//         stepBlock.innerHTML = `
//             <input class="inp-cbx" id="step-${i}" type="checkbox"/>
//             <label class="cbx" for="step-${i}">
//             <span>
//                 <svg width="12px" height="10px">
//                 <use xlink:href="#check-4"></use>
//                 </svg>
//             </span>
//             </label>
//             <svg class="inline-svg">
//             <symbol id="check-4" viewBox="0 0 12 10">
//                 <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
//             </symbol>
//             </svg>
//             <p class="checkbox-content">${step}</p>
//         `;

//         stepsContainer.appendChild(stepBlock);
//         });

//         // Reset button state when opening FAQ
//         proceedBtn.disabled = true;
//         updateProceedButtonState();


//         // Image
//         if (selected.image_url) {
//           previewImage.src = selected.image_url;
//           previewImage.style.display = "block";
//         } else {
//           previewImage.style.display = "none";
//         }
//       });
//     });
//   }

// function openFAQDetails(selected) {
//   overlay.classList.add("is-visible");
//   backdrop.classList.add("is-visible");

//   faqName.textContent = selected.question_title;

//   // Requirements
//   requirementsList.innerHTML = "";
//   const reqs = JSON.parse(selected.requirements || "[]");
//   reqs.forEach(r => {
//     const li = document.createElement("li");
//     li.textContent = r;
//     requirementsList.appendChild(li);
//   });

//   // Steps
//   stepsContainer.innerHTML = "";
//   const steps = JSON.parse(selected.steps || "[]");
//   steps.forEach((step, i) => {
//     const stepBlock = document.createElement("div");
//     stepBlock.classList.add("checkbox-wrapper-4", "mb-3");
//     stepBlock.innerHTML = `
//       <input class="inp-cbx" id="step-${i}" type="checkbox"/>
//       <label class="cbx" for="step-${i}">
//         <span>
//           <svg width="12px" height="10px"><use xlink:href="#check-4"></use></svg>
//         </span>
//       </label>
//       <svg class="inline-svg">
//         <symbol id="check-4" viewBox="0 0 12 10">
//           <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
//         </symbol>
//       </svg>
//       <p class="checkbox-content">${step}</p>
//     `;
//     stepsContainer.appendChild(stepBlock);
//   });

//   // Reset button state
//   proceedBtn.disabled = true;
//   updateProceedButtonState();

//   // Image
//   if (selected.image_url) {
//     previewImage.src = selected.image_url;
//     previewImage.style.display = "block";
//   } else {
//     previewImage.style.display = "none";
//   }
// }



// // Hide Overlay on Back Click
//     backBtn1.addEventListener("click", (e) => { // Use backBtn1
//         e.preventDefault();
//         overlay.classList.remove("is-visible");
//         backdrop.classList.remove("is-visible");

//         // Stop reading if active
//         if (window.speechSynthesis.speaking) {
//           window.speechSynthesis.cancel();
//           isReading = false;
//           readBtn.classList.remove("active");
//           readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
//         }
//     });

// // Listen for changes on ANY checkbox inside the container
//     stepsContainer.addEventListener("change", (event) => {
//         if (event.target.classList.contains("inp-cbx")) {
//             updateProceedButtonState();
//         }
//     });

//     // Listen for clicks on the Proceed Button
//     proceedBtn.addEventListener("click", () => {

//         if (window.speechSynthesis.speaking) {
//           window.speechSynthesis.cancel();
//           isReading = false;
//           readBtn.classList.remove("active");
//           readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
//         }
        

//         overlay.classList.remove("is-visible");
//         formOverlay.classList.add("is-visible");
//     });

//     backBtn2.addEventListener("click", (e) => {
//         e.preventDefault();
        
//         formOverlay.classList.remove("is-visible");

//         firstNameInput.value = "";
//         lastNameInput.value = "";

//         validateFormInputs();

//         overlay.classList.add("is-visible");

//         if (window.speechSynthesis.speaking) {
//           window.speechSynthesis.cancel();
//           isReading = false;
//           readBtn.classList.remove("active");
//           readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
//         }
//     });
    
//     firstNameInput.addEventListener("input", () => {
//         validateFormInputs();
//     });

//     lastNameInput.addEventListener("input", () => {
//         validateFormInputs();
//     });

//   // Initial Load
//   loadFAQs();


// // Realtime Listener for Kiosk Table
// supabaseClient.channel("realtime-kiosk-app")
//   .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async (payload) => {
//     console.log("🔄 Kiosk data changed:", payload);
//     await loadFAQs(); 
//   })
//   .subscribe();



// // Read Aloud Button Function
// const readBtn = document.querySelector(".speak-btn");
// let isReading = false;
// let currentUtterance = null;

// if (readBtn) {
//   readBtn.addEventListener("click", () => {
//     const synth = window.speechSynthesis;


//     if (isReading) {
//       synth.cancel();
//       isReading = false;
//       readBtn.classList.remove("active");
//       readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
//       return;
//     }


//     synth.cancel();
//     const title = faqName.textContent.trim();
//     let textToRead = `Process for ${title}. `;

//     const requirements = Array.from(requirementsList.querySelectorAll("li")).map(li => li.textContent.trim());
//     if (requirements.length > 0) {
//       textToRead += `Here are the requirements: ${requirements.join(", ")}. `;
//     } else {
//       textToRead += `No requirements listed. `;
//     }

//     const steps = Array.from(stepsContainer.querySelectorAll(".checkbox-content")).map(p => p.textContent.trim());
//     if (steps.length > 0) {
//       textToRead += `Now, follow these steps: ${steps.join(". ")}.`;
//     } else {
//       textToRead += `No steps available.`;
//     }

//     currentUtterance = new SpeechSynthesisUtterance(textToRead);
//     currentUtterance.rate = 1;
//     currentUtterance.pitch = 1;
//     currentUtterance.lang = "en-US";


//     currentUtterance.onstart = () => {
//       isReading = true;
//       readBtn.classList.add("active");
//       readBtn.innerHTML = `<i class="ph ph-speaker-slash"></i> Stop Reading`;
//     };


//     currentUtterance.onend = () => {
//       isReading = false;
//       readBtn.classList.remove("active");
//       readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
//     };

//     synth.speak(currentUtterance);
//   });
// }

// // Finish Button Handler
// // Finish Button Handler (with RawBT print)
// finishBtn.addEventListener("click", async (e) => {
//   e.preventDefault();

//   if (finishBtn.disabled) return; 
//   finishBtn.disabled = true;

//   const firstName = firstNameInput.value.trim();
//   const lastName = lastNameInput.value.trim();

//   if (!firstName || !lastName) {
//     alert("Please enter your complete name.");
//     finishBtn.disabled = false; 
//     return;
//   }

//   const fullName = `${firstName} ${lastName}`;

//   try {
//     // 1️⃣ Save to queue (API)
//     const response = await fetch("/api/queue", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ full_name: fullName }),
//     });

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.error || "Request failed");

//     const queueData = result.data[0];
//     const queueNumber = queueData.queue_no.toString();
//     numberPreview.textContent = queueNumber;

//     // 2️⃣ Show number screen
//     overlayForm.classList.remove("is-visible");
//     overlayNumber.classList.add("is-visible");

//     // 3️⃣ Clear inputs
//     firstNameInput.value = "";
//     lastNameInput.value = "";

//     // 4️⃣ Trigger RawBT print (fixed version)
//     const printContent = `
//     ===============================
//     University of Rizal System
//             Queue Ticket
//     ===============================

//     Name: ${fullName}
//     Queue No: ${queueNumber}

//     Thank you! Please wait
//     for your turn.

//     -------------------------------
//     Printed via REIGI Kiosk
//     `;


//     // Encode the HTML text for URL safety
//     const encoded = encodeURIComponent(printContent);

//     // Use RawBT direct scheme — works on all modern Android Chrome PWAs
//     const rawbtUrl = `rawbt:print?data=${encoded}`;

//     // Open RawBT directly
//     window.location.href = rawbtUrl;


//   } catch (err) {
//     console.error("❌ Error saving queue:", err.message);
//     alert("Something went wrong while saving your queue. Please try again.");
//     finishBtn.disabled = false;
//   }
// });

// // Reset back to the search screen
// const finishBtnNum = document.getElementById("finish-btn-num");
// finishBtnNum.addEventListener("click", () => {
//   overlayNumber.classList.remove("is-visible");
//   backdrop.classList.remove("is-visible");
//   window.location.reload(); 
// });

// });

// Import Supabase Client
import { supabaseClient } from '/js/supabase-client.js';

// Main Logic
document.addEventListener("DOMContentLoaded", async () => {
  const faqOptionContainer = document.querySelector(".faq-option-container");
  const overlay = document.querySelector(".container-overlay");
  const backdrop = document.getElementById("overlay-backdrop");

  // Voice Search Elements
  const voiceBtn = document.querySelector(".voice-btn");
  const voiceOverlay = document.querySelector(".voice-search-overlay");
  const voiceBackdrop = document.getElementById("voice-overlay-backdrop");
  const voiceBackBtn = document.querySelector(".voice-back-btn");
  const voiceCancelBtn = document.querySelector(".voice-cancel-btn");

  // Form & navigation
  const proceedBtn = document.getElementById("proceed-btn");
  const formOverlay = document.querySelector(".container-overlay-form");
  const backBtn1 = document.getElementById("back-btn-1");
  const backBtn2 = document.getElementById("back-btn-2");
  const overlayNumber = document.querySelector(".container-overlay-number");

  const faqName = document.querySelector(".faq-name");
  const requirementsList = document.querySelector(".faq-preview ol");
  const stepsContainer = document.querySelector(".preview-text");
  const previewImage = document.querySelector(".preview-image");

  const finishBtn = document.getElementById("finish-btn");
  const firstNameInput = formOverlay.querySelector('input[placeholder="First Name"]');
  const lastNameInput = formOverlay.querySelector('input[placeholder="Last Name"]');
  const numberPreview = document.querySelector(".number-preview");

  // Voice Recognition Setup
  let recognition;
  if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;       // keep false for single command
  recognition.interimResults = true;     // <-- enable live results
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
      const voiceTitleEl = document.querySelector(".voice-title");
      voiceTitleEl.innerHTML = `Didn't heard you :( <a href="#" class="voice-retry">Retry</a>`;
      
      // Add click handler for retry button
      const retryButton = voiceTitleEl.querySelector(".voice-retry");
      retryButton.addEventListener("click", (e) => {
        e.preventDefault();
        voiceTitleEl.textContent = "Listening...";
        document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
        try {
          recognition.start();
        } catch(err) {
          console.warn("Voice recognition already started", err);
        }
      });
  };

  

  recognition.onresult = (event) => {
    // Combine all interim results
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcript = transcript.toLowerCase().trim();

    // Update subtitle live
    document.querySelector(".voice-subtitle").textContent = transcript;

    // Only check for match if the result is final
    if (event.results[event.results.length - 1].isFinal) {
      const matched = kioskData.find(faq =>
        transcript.includes(faq.question_title.toLowerCase()) ||
        faq.question_title.toLowerCase().includes(transcript)
      );

      if (matched) {
        console.log("✅ Matched FAQ:", matched.question_title);
        document.querySelector(".voice-title").textContent = "Recognized!";
        setTimeout(() => {
          voiceOverlay.classList.remove("is-visible");
          voiceBackdrop.classList.remove("is-visible");
          openFAQDetails(matched);
        }, 1000);
      } else {
        console.log("❌ No match found for:", transcript);
        document.querySelector(".voice-title").textContent = "No match found";
        // Subtitle already shows what user said
      }
    }
  };

  // --- TEST FUNCTION: Simulate voice input via console ---
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


  // Voice overlay handlers
  voiceBtn.addEventListener("click", () => {
    voiceOverlay.classList.add("is-visible");
    voiceBackdrop.classList.add("is-visible");
    document.querySelector(".voice-title").textContent = "Listening...";
    document.querySelector(".voice-subtitle").textContent = "Speak the process name...";
    try { recognition.start(); } catch(err) { console.warn("Voice recognition already started", err); }
  });

  function closeVoiceOverlay() {
    voiceOverlay.classList.remove("is-visible");
    voiceBackdrop.classList.remove("is-visible");
  }
  voiceBackBtn.addEventListener("click", e => { e.preventDefault(); closeVoiceOverlay(); });
  voiceCancelBtn.addEventListener("click", closeVoiceOverlay);
  voiceBackdrop.addEventListener("click", closeVoiceOverlay);

  // Checkbox & form validation
  function updateProceedButtonState() {
    const allCheckboxes = stepsContainer.querySelectorAll(".inp-cbx");
    const checkedCheckboxes = stepsContainer.querySelectorAll(".inp-cbx:checked");
    proceedBtn.disabled = !(allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length);
  }

  function validateFormInputs() {
    finishBtn.disabled = !(firstNameInput.value.trim() && lastNameInput.value.trim());
  }

  firstNameInput.addEventListener("input", validateFormInputs);
  lastNameInput.addEventListener("input", validateFormInputs);

  // Global FAQ data
  let kioskData = [];

  async function loadFAQs() {
    const { data, error } = await supabaseClient.from("kiosk").select("*").order("created_at", { ascending: false });
    if (error) { console.error("❌ Error loading FAQs:", error); return; }

    kioskData = data;
    faqOptionContainer.innerHTML = "";

    data.forEach(faq => {
      const faqOption = document.createElement("div");
      faqOption.classList.add("faq-option");
      faqOption.dataset.id = faq.id;
      faqOption.innerHTML = `<i class="ph ph-magnifying-glass"></i><span class="faq-option-name">${faq.question_title}</span>`;
      faqOptionContainer.appendChild(faqOption);
    });

    attachFAQClickHandlers(data);
  }

  function attachFAQClickHandlers(faqData) {
    document.querySelectorAll(".faq-option").forEach(option => {
      option.addEventListener("click", () => {
        const selected = faqData.find(f => f.id == option.dataset.id);
        if (!selected) return;
        openFAQDetails(selected);
      });
    });
  }

  function openFAQDetails(selected) {
    overlay.classList.add("is-visible");
    backdrop.classList.add("is-visible");
    faqName.textContent = selected.question_title;

    // Requirements
    requirementsList.innerHTML = "";
    (JSON.parse(selected.requirements || "[]")).forEach(r => {
      const li = document.createElement("li");
      li.textContent = r;
      requirementsList.appendChild(li);
    });

    // Steps
    stepsContainer.innerHTML = "";
    (JSON.parse(selected.steps || "[]")).forEach((step, i) => {
      const stepBlock = document.createElement("div");
      stepBlock.classList.add("checkbox-wrapper-4", "mb-3");

      // Unique checkbox IDs
      const cbxId = `step-${selected.id}-${i}`;
      stepBlock.innerHTML = `
        <input class="inp-cbx" id="${cbxId}" type="checkbox"/>
        <label class="cbx" for="${cbxId}">
          <span>
            <svg width="12px" height="10px"><use xlink:href="#check-4"></use></svg>
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

    proceedBtn.disabled = true;
    updateProceedButtonState();

    // Image
    if (selected.image_url) {
      previewImage.src = selected.image_url;
      previewImage.style.display = "block";
    } else previewImage.style.display = "none";
  }

  // Overlay Back Buttons
  backBtn1.addEventListener("click", e => {
    e.preventDefault();
    overlay.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    stopReading();
  });

  proceedBtn.addEventListener("click", () => {
    overlay.classList.remove("is-visible");
    formOverlay.classList.add("is-visible");
    stopReading();
  });

  backBtn2.addEventListener("click", e => {
    e.preventDefault();
    formOverlay.classList.remove("is-visible");
    firstNameInput.value = lastNameInput.value = "";
    validateFormInputs();
    overlay.classList.add("is-visible");
    stopReading();
  });

  stepsContainer.addEventListener("change", e => {
    if (e.target.classList.contains("inp-cbx")) updateProceedButtonState();
  });

  function stopReading() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      isReading = false;
      readBtn.classList.remove("active");
      readBtn.innerHTML = `<i class="ph ph-user-sound"></i> Read Aloud`;
    }
  }

  // Read Aloud
  const readBtn = document.querySelector(".speak-btn");
  let isReading = false;
  let currentUtterance = null;

    function getMaleVoice() {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    // Prefer English male voice
    return voices.find(v => 
      v.lang.startsWith("en") && /male|man|david|mark|michael/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith("en")); // fallback
  }


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

      let textToRead = `Process for ${faqName.textContent.trim()}. `;
      const requirements = Array.from(requirementsList.querySelectorAll("li")).map(li => li.textContent.trim());
      textToRead += requirements.length ? `Here are the requirements: ${requirements.join(", ")}. ` : "No requirements listed. ";

      const steps = Array.from(stepsContainer.querySelectorAll(".checkbox-content")).map(p => p.textContent.trim());
      textToRead += steps.length ? `Now, follow these steps: ${steps.join(". ")}.` : "No steps available.";

      currentUtterance = new SpeechSynthesisUtterance(textToRead);
      currentUtterance.rate = 1; // clean pace
      currentUtterance.pitch = 1; // natural pitch
      currentUtterance.lang = "en-US";
      currentUtterance.voice = getMaleVoice(); // select male voice


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


  // Finish Button (RawBT Print)
  finishBtn.addEventListener("click", async e => {
    e.preventDefault();
    if (finishBtn.disabled) return;
    finishBtn.disabled = true;

    const fullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;
    if (!fullName.trim()) { alert("Please enter your complete name."); finishBtn.disabled = false; return; }

    try {
      const response = await fetch("/api/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: fullName }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");

      const queueNumber = result.data[0].queue_no.toString();
      numberPreview.textContent = queueNumber;

      formOverlay.classList.remove("is-visible");
      overlayNumber.classList.add("is-visible");

      firstNameInput.value = lastNameInput.value = "";

      const printContent = `
===============================
University of Rizal System
        Queue Ticket
===============================

Name: ${fullName}
Queue No: ${queueNumber}

Thank you! Please wait
for your turn.

-------------------------------
Printed via REIGI Kiosk
      `;
      const encoded = encodeURIComponent(printContent);
      window.location.href = `rawbt:print?data=${encoded}`;

    } catch (err) {
      console.error("❌ Error saving queue:", err.message);
      alert("Something went wrong while saving your queue. Please try again.");
      finishBtn.disabled = false;
    }
  });

  // Reset to search screen
  const finishBtnNum = document.getElementById("finish-btn-num");
  finishBtnNum.addEventListener("click", () => {
    overlayNumber.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    window.location.reload();
  });

  // Initial load
  loadFAQs();

  // Supabase realtime listener
  supabaseClient.channel("realtime-kiosk-app")
    .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async () => {
      console.log("🔄 Kiosk data changed");
      await loadFAQs();
    })
    .subscribe();

});

