// Supabase Config
// =======================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Script to load sidebar 
fetch('sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('sidebar-container').innerHTML = data;

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu li a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });

    // ✅ Toggle button handler
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainHeader = document.querySelector('.main-header');

    if (toggleBtn && sidebar && mainContent && mainHeader) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('small-sidebar');
        const isSmall = sidebar.classList.contains('small-sidebar');
        mainContent.style.marginLeft = isSmall ? '80px' : '250px';
        mainHeader.style.width = isSmall ? 'calc(100% - 80px)' : 'calc(100% - 250px)';
        mainHeader.style.marginLeft = isSmall ? '80px' : '250px';
        window.dispatchEvent(new Event('resize'));
      });
    }

    // ✅ Logout button handler (AFTER injection)
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        console.log("Logout clicked"); // Debug log
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error.message);
        } else {
          window.location.href = "login.html";
        }
      });
    } else {
      console.warn("⚠️ Logout button not found in sidebar!");
    }
  })
  .catch(error => console.error('Error loading sidebar:', error));
