
    (function() {
      const dropdown = document.getElementById('dropdown');
      const dropdownContent = document.getElementById('dropdown-content');
      const selected = document.getElementById('selected');
      const options = dropdownContent.querySelectorAll('div[role="option"]');
    
      // Detect page type from body class
      if (document.body.classList.contains("site-media-graduate-page")) {
        selected.textContent = "Graduate";
      } else if (document.body.classList.contains("site-media-undergraduate-page")) {
        selected.textContent = "Undergraduate";
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
    
          // ✅ Redirect logic added here
          if (value === "Graduate") {
            window.location.href = "admin_site_media_graduate.html";
          } else if (value === "Undergraduate") {
            window.location.href = "admin_site_media_undergraduate.html";
          }
        });
    
        // Keyboard support
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
    
      // Keyboard accessibility for dropdown
      dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dropdown.classList.remove('open');
          dropdown.focus();
        } else if (e.key === 'ArrowDown' && !dropdown.classList.contains('open')) {
          dropdown.classList.add('open');
          options[0].focus();
        }
      });
    })();