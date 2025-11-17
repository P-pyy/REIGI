import { supabaseClient } from '/js/supabase-client.js';

// Get id from URL
const params = new URLSearchParams(window.location.search);
const faqId = params.get("id");

// ===============================
// Load FAQ function
// ===============================
async function loadFaq() {
  const { data, error } = await supabaseClient
    .from("faqs")
    .select("*")
    .eq("id", faqId)
    .single();

  if (error) {
    console.error("Error fetching FAQ:", error);
    return;
  }

  // Question title & post title
  document.querySelector(".faq-name").textContent = data.post_title || "";

  // Requirements
  const requirementsContainer = document.querySelector(".faq-preview ol");
  requirementsContainer.innerHTML = "";
  let requirements = [];
  try { requirements = data.requirements ? JSON.parse(data.requirements) : []; } catch(e){ }
  if (requirements.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No requirements listed.";
    li.className = "faq-item";
    requirementsContainer.appendChild(li);
  } else {
    requirements.forEach(req => {
      const li = document.createElement("li");
      li.textContent = req;
      li.className = "faq-item";
      requirementsContainer.appendChild(li);
    });
  }

  // Steps
  const stepsContainer = document.querySelector(".preview-text");
  stepsContainer.innerHTML = ""; // clear previous content
  let steps = [];
  try { steps = data.steps ? JSON.parse(data.steps) : []; } catch(e){ }

  if (steps.length > 0) {
    steps.forEach((step, index) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>Step ${index + 1}:</strong> ${step}`;
      stepsContainer.appendChild(p);
    });
  } else {
    stepsContainer.innerHTML = "<p>No steps provided.</p>";
  }

  // Image
  const imgEl = document.querySelector(".preview-image");
  if (data.image_url) {
    imgEl.src = data.image_url;
    imgEl.style.display = "block";
  } else {
    imgEl.style.display = "none";
  }
}

// ===============================
// Real-time subscription
// ===============================
supabaseClient
  .channel('realtime-faqs')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'faqs', filter: `id=eq.${faqId}` },
    async (payload) => {
      console.log('FAQ updated in realtime:', payload);
      await loadFaq(); // reload FAQ dynamically
    }
  )
  .subscribe();

// ===============================
// Initial load
// ===============================
loadFaq();

// ===============================
// Go Back button
// ===============================
document.querySelector(".go-back-btn").addEventListener("click", () => {
  history.back();
});
