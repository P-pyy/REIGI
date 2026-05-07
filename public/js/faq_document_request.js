import { supabaseClient } from '/js/supabase-client.js';

  async function loadFAQs() {
    const { data, error } = await supabaseClient
      .from("faqs")
      .select("*")
      .eq("category", "document-request");

    if (error) {
      console.error("Error fetching FAQs:", error);
      return;
    }

    const list = document.querySelector(".faq-list");
    list.innerHTML = `<h5 class="mb-5 faq-title text-start" style="margin-left: -1em;">FREQUENTLY ASKED QUESTIONS:</h5>`;

    data.forEach(faq => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="#" onclick="openFAQ(${faq.id})">${faq.post_title}</a>
        <i class="ph ph-arrow-up-right" style="color: #0055A5;"></i>
      `;
      list.appendChild(li);
    });
  }

  const searchInput = document.getElementById("faq-search");
  const resultsDiv = document.getElementById("search-results");

   async function searchFAQs(query) {
  if (!query.trim()) {
    resultsDiv.innerHTML = "";
    resultsDiv.style.display = "none";
    return;
  } else {
    resultsDiv.style.display = "block"; 
  }

  const { data, error } = await supabaseClient
    .from("faqs")
    .select("id, post_title, category")
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
      <a href="/faq-article?id=${faq.id}">
        [${faq.category.replace("-", " ").toUpperCase()}] ${faq.post_title}
      </a>
    </div>
  `).join("");
  }

  searchInput.addEventListener("input", e => {
    searchFAQs(e.target.value);
  });

  document.addEventListener("DOMContentLoaded", loadFAQs);

   window.openFAQ = async function(id) {
  try {
    await fetch('/api/increment-faq-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqId: id }),
    });
  } catch (err) {
    console.error("Error incrementing views:", err);
  }
  window.location.href = `/faq-article?id=${id}`;
};

