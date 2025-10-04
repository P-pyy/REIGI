  import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

    const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get id from URL
    const params = new URLSearchParams(window.location.search);
    const faqId = params.get("id");

    async function loadFaq() {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("id", faqId)
        .single();

      if (error) {
        console.error("Error fetching FAQ:", error);
        return;
      }

      // Update page title
      document.querySelector(".page-title").textContent = data.question_title;

      // Update breadcrumb dynamically
      document.querySelector(".breadcrumb-custom").textContent =
        `Frequently Asked Questions > ${formatCategory(data.category)} > ${data.post_title}`;

      // Update only the date span
      document.querySelector("#updated-date").textContent =
        new Date(data.date_posted).toLocaleDateString();

      // Replace the details section
      document.querySelector("#faq-details").innerHTML = data.details;

      // Handle image (hide if none)
      if (data.image_url) {
        document.querySelector("#faq-image").src = data.image_url;
        document.querySelector("#faq-image").style.display = "block";
      } else {
        document.querySelector("#faq-image").style.display = "none";
      }
    }

    // Helper: map category slug to readable name
    function formatCategory(cat) {
      const map = {
        "enrollment-process": "Enrollment Process",
        "graduation-clearance": "Graduation & Clearance",
      };
      return map[cat] || "FAQ";
    }

    // Call the function
    loadFaq();

    // Handle Go Back button
    document.querySelector(".go-back-btn").addEventListener("click", () => {
      window.location.href = "/faq";
    });