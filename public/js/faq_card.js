import { supabaseClient } from '/js/supabase-client.js';

const params = new URLSearchParams(window.location.search);
const faqId = params.get("id");

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

  document.querySelector(".faq-name").textContent = data.post_title || "";

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

  const stepsContainer = document.querySelector(".preview-text");
  stepsContainer.innerHTML = "";
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

  const imgEl = document.querySelector(".preview-image");
  if (data.image_url) {
    imgEl.src = data.image_url;
    imgEl.style.display = "block";
  } else {
    imgEl.style.display = "none";
  }
}

supabaseClient
  .channel('realtime-faqs')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'faqs', filter: `id=eq.${faqId}` },
    async (payload) => {
      console.log('FAQ updated in realtime:', payload);
      await loadFaq();
    }
  )
  .subscribe();
loadFaq();

document.querySelector(".go-back-btn").addEventListener("click", () => {
  history.back();
});
