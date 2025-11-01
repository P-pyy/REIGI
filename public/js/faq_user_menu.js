import { supabaseClient } from '/js/supabase-client.js';

  const searchInput = document.getElementById("faq-search");
  const resultsDiv = document.getElementById("search-results");

  // Map categories to readable text
  function formatCategory(cat) {
    const map = {
      "enrollment": "Enrollment",
      "document-request": "Document Request",
      "graduation-clearance": "Graduation & Clearance",
    };
    return map[cat] || "FAQ";
  }

  // Search FAQs
  async function searchFAQs(query) {
    if (!query.trim()) {
      resultsDiv.innerHTML = "";
      resultsDiv.style.display = "none"; 
      return;
    }

    resultsDiv.style.display = "block"; 

    const { data, error } = await supabaseClient
      .from("faqs")
      .select("id, category, post_title")
      .ilike("post_title", `%${query}%`);

    if (error) {
      console.error("Error searching FAQs:", error);
      return;
    }

    if (!data || data.length === 0) {
      resultsDiv.innerHTML = `<p class="text-muted">No results found.</p>`;
      return;
    }

   resultsDiv.innerHTML = data.map(faq => `
      <div class="search-result mb-2">
        <a href="/faq-article?id=${faq.id}" data-faq-id="${faq.id}">
          Frequently Asked Questions > ${formatCategory(faq.category)} > ${faq.post_title}
        </a>
      </div>
    `).join("");
  }
  

  // Attach click handler (delegated so it works with dynamic results)
  resultsDiv.addEventListener("click", async e => {
  const link = e.target.closest("a[data-faq-id]");
  if (!link) return;

  e.preventDefault();
  const faqId = link.dataset.faqId;

  try {
    await fetch('/api/increment-faq-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqId }),
    });
  } catch (err) {
    console.error("Error incrementing FAQ views:", err.message);
  }

  window.location.href = link.href;
});


  // Trigger search on typing
  searchInput.addEventListener("input", e => {
    searchFAQs(e.target.value);
  });