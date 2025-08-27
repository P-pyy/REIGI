

/* SITE MEDIA DROP DOWN BUTTON */




(function() {
    const dropdown = document.getElementById('dropdown');
    const dropdownContent = document.getElementById('dropdown-content');
    const selected = document.getElementById('selected');
    const options = dropdownContent.querySelectorAll('div[role="option"]');
  
    // Auto-detect current page based on filename
    const currentPage = window.location.pathname.toLowerCase();
    if (currentPage.includes("graduate")) {
      selected.textContent = "Graduate";
    } else if (currentPage.includes("undergraduate")) {
      selected.textContent = "Undergraduate";
    } else {
      selected.textContent = "Select Level";
    }
  
    // Toggle dropdown open/close
    dropdown.addEventListener('click', () => {
      dropdown.classList.toggle('open');
    });
  
    // Selecting option from dropdown
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value');
            selected.textContent = value;
            dropdown.classList.remove('open');
          
            // Redirect based on choice
            if (value === "Undergraduate") {
                window.location.href = "admin_site_media_undergraduate.html";
              } else if (value === "Graduate") {
                window.location.href = "admin_site_media_graduate.html";
              }
          });
  
      // Keyboard navigation
      option.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.target.click();
        }
      });
    });
  
    // Close dropdown on outside click
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
      }
    });
  })();
  