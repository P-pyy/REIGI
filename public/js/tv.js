import { supabaseClient } from '/js/supabase-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const window1Number = document.getElementById("window-1-number");
  const window2Number = document.getElementById("window-2-number");
  // const normalTicketsContainer = document.getElementById("normal-tickets");
  // const priorityTicketsContainer = document.getElementById("priority-tickets");
  const dateText = document.querySelector(".date-text");
  const timeText = document.querySelector(".time-text");
  const amPmText = document.querySelector(".AM-PM-text");
  const MAX_NORMAL = 5;
  const MAX_PRIORITY = 5;

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
    // 1. Select the container elements
    const groupContainer = document.querySelector(".group-container"); // Select Parent
    const normalTicketsContainer = document.getElementById("normal-tickets");
    const priorityTicketsContainer = document.getElementById("priority-tickets");

    // 2. Fetch Processing Data
    const { data: processingData, error: processingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "processing");

    if (processingError) return console.error(processingError);

    // Update Window Displays
    const window1Ticket = processingData.find(d => d.window_name?.toLowerCase() === "window 1".toLowerCase());
    const window2Ticket = processingData.find(d => d.window_name?.toLowerCase() === "window 2".toLowerCase());

    window1Number.textContent = window1Ticket ? window1Ticket.queue_no : 0;
    window2Number.textContent = window2Ticket ? window2Ticket.queue_no : 0;

    // 3. Fetch Waiting Data
    const { data: waitingData, error: waitingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "queue")
      .order("queue_no", { ascending: true });

    if (waitingError) return console.error(waitingError);

    // 4. Data Separation
    const priorityWaiting = waitingData.filter(t => Boolean(t.is_priority));
    const normalWaiting = waitingData.filter(t => !Boolean(t.is_priority));

    // 5. LOGIC FIX: State-Based Toggling
    // We toggle the 'dual-mode' class on the PARENT container.
    // CSS handles the rest (widths, display:none/flex).
    if (priorityWaiting.length > 0) {
        console.log("State: Dual Mode (Priority Active)");
        groupContainer.classList.add("dual-mode");
    } else {
        console.log("State: Single Mode (No Priority)");
        groupContainer.classList.remove("dual-mode");
    }

    // 6. Limit and Render
    const limitedPriority = priorityWaiting.slice(0, MAX_PRIORITY);
    const limitedNormal = normalWaiting.slice(0, MAX_NORMAL);

    // Clear UI
    priorityTicketsContainer.innerHTML = "";
    normalTicketsContainer.innerHTML = "";

    // Render Priority
    limitedPriority.forEach(ticket => {
      const div = document.createElement("div");
      div.className = "container-ticket-number priority";
      div.textContent = ticket.queue_no;
      priorityTicketsContainer.appendChild(div);
    });

    // Render Normal
    limitedNormal.forEach(ticket => {
      const div = document.createElement("div");
      div.className = "container-ticket-number";
      div.textContent = ticket.queue_no;
      normalTicketsContainer.appendChild(div);
    });
  }

  await loadTVData();

  let lastAnnouncedId = null;

supabaseClient
    .channel("queue-tv") // Connect to the same channel name as Kiosk.js
    // 1. Listen for Database Changes (Automatic First Call)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "queue" },
      (payload) => {
        const oldRow = payload.old;
        const newRow = payload.new;

        loadTVData(); // Refresh screen numbers

        // Announce ONLY when moved to processing (First time)
        if (oldRow.status !== "processing" && newRow.status === "processing") {
          if (lastAnnouncedId === newRow.id) return;
          lastAnnouncedId = newRow.id;
          announceQueue(newRow.queue_no, newRow.window_name);
        }
      }
    )
    // 2. Listen for Manual "Repeat Call" from Admin (Broadcast)
    .on(
      "broadcast",
      { event: "repeat-call" },
      (payload) => {
        console.log("📢 Repeat call received:", payload);
        // Trigger the voice immediately using data sent from Admin
        announceQueue(payload.payload.queueNo, payload.payload.windowName);
      }
    )
    .subscribe((status) => {
      // Optional: Log connection status
      if (status === 'SUBSCRIBED') {
        console.log('✅ Connected to queue-tv channel');
      }
    });
});
