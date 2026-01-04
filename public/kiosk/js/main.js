import { supabaseClient } from '/js/supabase-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const faqOptionContainer = document.querySelector(".faq-option-container");
  const overlay = document.querySelector(".container-overlay");
  const backdrop = document.getElementById("overlay-backdrop");

  const voiceBtn = document.querySelector(".voice-btn");
  const voiceOverlay = document.querySelector(".voice-search-overlay");
  const voiceBackdrop = document.getElementById("voice-overlay-backdrop");
  const voiceBackBtn = document.querySelector(".voice-back-btn");
  const voiceCancelBtn = document.querySelector(".voice-cancel-btn");

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

  let kioskData = [];

  let recognition;
  let voiceMatched = false; 
  let transcriptBuffer = "";
  let faqAliases = [];


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

  function updateProceedButtonState() {
    const all = stepsContainer.querySelectorAll(".inp-cbx");
    const checked = stepsContainer.querySelectorAll(".inp-cbx:checked");
    proceedBtn.disabled = !(all.length && all.length === checked.length);
  }

  function validateFormInputs() {
    finishBtn.disabled = !(firstNameInput.value.trim() && lastNameInput.value.trim());
  }

  firstNameInput.addEventListener("input", validateFormInputs);
  lastNameInput.addEventListener("input", validateFormInputs);

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
    faqOptionContainer.innerHTML = "";

    data.forEach(faq => {
      const faqOption = document.createElement("div");
      faqOption.classList.add("faq-option");
      faqOption.dataset.id = faq.id;
      faqOption.innerHTML = `<i class="ph ph-magnifying-glass"></i><span class="faq-option-name">${faq.question_title}</span>`;
      faqOptionContainer.appendChild(faqOption);
    });

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
    document.querySelectorAll(".faq-option").forEach(option => {
      option.addEventListener("click", () => {
        const selected = data.find(f => f.id == option.dataset.id);
        if (selected) openFAQDetails(selected);
      });
    });
  }

  function openFAQDetails(selected) {
    overlay.classList.add("is-visible");
    backdrop.classList.add("is-visible");
    faqName.textContent = selected.question_title;

    requirementsList.innerHTML = "";
    (JSON.parse(selected.requirements || "[]")).forEach(r => {
      const li = document.createElement("li");
      li.textContent = r;
      requirementsList.appendChild(li);
    });

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

    proceedBtn.disabled = true;
    updateProceedButtonState();

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

            requestAnimationFrame(() => {
               previewImage.classList.add("loaded"); 
            });
        };

        imgLoader.onerror = () => {
            console.error("Failed to load image:", selected.image_url);
            previewImage.style.display = "none";
        };

    } else {
        previewImage.style.display = "none";
    }
  }

  backBtn1.addEventListener("click", (e) => {
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

  backBtn2.addEventListener("click", (e) => {
    e.preventDefault();
    formOverlay.classList.remove("is-visible");
    firstNameInput.value = lastNameInput.value = "";
    validateFormInputs();
    overlay.classList.add("is-visible");
    stopReading();
  });

  stepsContainer.addEventListener("change", (e) => {
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

  const readBtn = document.querySelector(".speak-btn");
  let isReading = false;
  let currentUtterance = null;

  function getMaleVoice() {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    return (
      voices.find(v => v.lang.startsWith("en") && /male|man|david|mark|michael/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("en"))
    );
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

    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");

      const queueNumber = result.data[0].queue_no.toString();
      numberPreview.textContent = queueNumber;

      formOverlay.classList.remove("is-visible");
      overlayNumber.classList.add("is-visible");

      firstNameInput.value = lastNameInput.value = "";

      const printContent = `
[C]===============================
[C]   University of Rizal System
[C]   Queue Ticket
[C]===============================

[L]  Name: 
[C][BIG]B]${fullName.toUpperCase()}
[L]  Queue No: 
[C][BIG]B]${queueNumber}
 
[C]  Please wait for your turn.
[C]  Thank you!

[C]-------------------------------
[C]  Printed via REIGI Kiosk
      `;
    
      const encoded = encodeURIComponent(printContent);
      window.location.href = `rawbt:printText:${encoded}`;
    } catch (err) {
      console.error("❌ Error saving queue:", err.message);
      alert("Something went wrong while saving your queue. Please try again.");
      finishBtn.disabled = false;
    }
  });

  const finishBtnNum = document.getElementById("finish-btn-num");
  finishBtnNum.addEventListener("click", () => {
    overlayNumber.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    window.location.reload();
  });

  loadFAQs();

  supabaseClient
    .channel("realtime-kiosk-app")
    .on("postgres_changes", { event: "*", schema: "public", table: "kiosk" }, async () => {
      console.log("🔄 Kiosk data changed");
      await loadFAQs();
    })
    .subscribe();
});


