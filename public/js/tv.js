import { supabaseClient } from '/js/supabase-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const window1Number = document.getElementById("window-1-number");
  const window2Number = document.getElementById("window-2-number");
  const ticketsContainer = document.getElementById("tickets");
  const dateText = document.querySelector(".date-text");
  const timeText = document.querySelector(".time-text");
  const amPmText = document.querySelector(".AM-PM-text");
  const MAX_WAITING = 10; 

  function updateDateTime() {
    const now = new Date();
    
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    dateText.textContent = `${month}/${day}/${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    timeText.textContent = String(hours).padStart(2, '0') + ":" + minutes;
    amPmText.textContent = ampm;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  async function loadTVData() {
    const { data: processingData, error: processingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "processing");

    if (processingError) return console.error(processingError);

    const window1Ticket = processingData.find(d => d.window_name?.toLowerCase() === "window 1".toLowerCase());
    const window2Ticket = processingData.find(d => d.window_name?.toLowerCase() === "window 2".toLowerCase());


    window1Number.textContent = window1Ticket ? window1Ticket.queue_no : 0;
    window2Number.textContent = window2Ticket ? window2Ticket.queue_no : 0;

    const { data: waitingData, error: waitingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "queue")
      .order("queue_no", { ascending: true });

    if (waitingError) return console.error(waitingError);

    const limitedWaitingData = waitingData.slice(0, MAX_WAITING);

    ticketsContainer.innerHTML = "";

    limitedWaitingData.forEach(ticket => {
      const div = document.createElement("div");
      div.className = "container-ticket-number";
      div.textContent = ticket.queue_no;
      ticketsContainer.appendChild(div);
    });
  }

  loadTVData();

  setInterval(loadTVData, 3000);

    function announceQueue(queueNo, windowName) {
    if (!('speechSynthesis' in window)) {
      console.warn("Text-to-Speech not supported");
      return;
    }

    const message = `Now calling queue number ${queueNo} Please proceed to ${windowName}`;

    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.cancel(); // stop previous speech
    speechSynthesis.speak(utterance);
  }

  let lastAnnouncedId = null;

supabaseClient
  .channel("queue-tv")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "queue" },
    (payload) => {
      const oldRow = payload.old;
      const newRow = payload.new;

      // Refresh TV display
      loadTVData();

      // Announce ONLY when moved to processing
      if (
        oldRow.status !== "processing" &&
        newRow.status === "processing"
      ) {
        // prevent duplicate speech
        if (lastAnnouncedId === newRow.id) return;

        lastAnnouncedId = newRow.id;
        announceQueue(newRow.queue_no, newRow.window_name);
      }
    }
  )
  .subscribe();


//   supabaseClient.channel("realtime-queue")
//     .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
//       loadTVData();
//     })
//     .subscribe();
});
