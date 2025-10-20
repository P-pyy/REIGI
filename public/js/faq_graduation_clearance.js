// Supabase
import { supabase } from "./supabaseClient.js";

  // Load only Graduation & Clearance FAQs by default
  async function loadFAQs() {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("category", "graduation-clearance");

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

  // search across all categories
  const searchInput = document.getElementById("faq-search");
  const resultsDiv = document.getElementById("search-results");

 async function searchFAQs(query) {
  if (!query.trim()) {
    resultsDiv.innerHTML = "";
    resultsDiv.style.display = "none"; // hide results when empty
    return;
  } else {
    resultsDiv.style.display = "block"; // show results when typing
  }

  const { data, error } = await supabase
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
  // Trigger search on typing
  searchInput.addEventListener("input", e => {
    searchFAQs(e.target.value);
  });

  // Load default category FAQs on page load
  document.addEventListener("DOMContentLoaded", loadFAQs);

  // Open FAQ and increment view
    window.openFAQ = async function(id) {
      try {
        const { error } = await supabase.rpc("increment_view", { faq_id: id });
        if (error) console.error("Error incrementing views:", error);
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
      window.location.href = `/faq-article?id=${id}`;
    };