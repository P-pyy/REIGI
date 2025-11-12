// tv.js
import { supabaseClient } from '/js/supabase-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const window1Number = document.getElementById("window-1-number");
  const window2Number = document.getElementById("window-2-number");
  const ticketsContainer = document.getElementById("tickets");
  const MAX_WAITING = 10; // Limit for waiting tickets

  async function loadTVData() {
    // Get the currently processing tickets
    const { data: processingData, error: processingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "processing");

    if (processingError) return console.error(processingError);

    // Update window numbers
    const window1Ticket = processingData.find(d => d.window_name === "WINDOW 1");
    const window2Ticket = processingData.find(d => d.window_name === "WINDOW 2");

    window1Number.textContent = window1Ticket ? window1Ticket.queue_no : 0;
    window2Number.textContent = window2Ticket ? window2Ticket.queue_no : 0;

    // Get waiting tickets
    const { data: waitingData, error: waitingError } = await supabaseClient
      .from("queue")
      .select("*")
      .eq("status", "queue")
      .order("queue_no", { ascending: true });

    if (waitingError) return console.error(waitingError);

    // Limit to 10 waiting tickets
    const limitedWaitingData = waitingData.slice(0, MAX_WAITING);

    // Clear previous waiting tickets
    ticketsContainer.innerHTML = "";

    limitedWaitingData.forEach(ticket => {
      const div = document.createElement("div");
      div.className = "container-ticket-number";
      div.textContent = ticket.queue_no;
      ticketsContainer.appendChild(div);
    });
  }

  // Initial load
  loadTVData();

  // Refresh every 3 seconds
  setInterval(loadTVData, 3000);

  // Realtime subscription
  supabaseClient.channel("realtime-queue")
    .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
      loadTVData();
    })
    .subscribe();
});
