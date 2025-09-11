//  Script to load sidebar 
      document.addEventListener('DOMContentLoaded', () => {
      fetch('sidebar.html')
        .then(res => res.text())
        .then(data => {
          document.getElementById('sidebar-container').innerHTML = data;

          // Highlight active page
          const currentPage = window.location.pathname.split("/").pop();
          document.querySelectorAll(".menu li a").forEach(link => {
            if (link.getAttribute("href") === currentPage) {
              link.classList.add("active");
            }
          });

          // Set up toggle event listener
          const toggleBtn = document.querySelector('.toggle-btn');
          const sidebar = document.querySelector('.sidebar');
          const mainContent = document.querySelector('.main-content');
          const mainHeader = document.querySelector('.main-header');
          const rowSumCards = document.querySelector('.row-sum-cards');
          const chartContainer = document.querySelector('.chart-container');
          const faqCard = document.querySelector('.faq-card');

          if (toggleBtn && sidebar && mainContent && mainHeader) {
            toggleBtn.addEventListener('click', () => {
              sidebar.classList.toggle('small-sidebar');
              mainContent.classList.toggle('adjusted');
              mainHeader.classList.toggle('adjusted');
              if (rowSumCards) rowSumCards.classList.toggle('adjusted');
              if (chartContainer) chartContainer.classList.toggle('adjusted');
              if (faqCard) faqCard.classList.toggle('adjusted');
              window.dispatchEvent(new Event('resize'));
            });
          } else {
            console.error('Required elements not found for toggle functionality');
          }
        })
        .catch(error => console.error('Error loading sidebar:', error));
    });

    //  <!-- Sidebar & Dynamic Content JS -->
    // Load sidebar
    fetch('sidebar.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        // Highlight current page
        const currentPage = window.location.pathname.split("/").pop();
        document.querySelectorAll(".menu li a").forEach(link => {
          if (link.getAttribute("href") === currentPage) link.classList.add("active");
        });

        // Sidebar toggle
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
          });
        }
      })
      .catch(console.error);

    // Handle dynamic content swap
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('upload-btn')) {
        const targetFile = e.target.dataset.target;
        const mediaContainer = document.getElementById('media-container');

        try {
          const res = await fetch(targetFile);
          if (!res.ok) throw new Error('Failed to load ' + targetFile);
          mediaContainer.innerHTML = await res.text();
        } catch (err) {
          console.error(err);
          mediaContainer.innerHTML = `<p class="text-danger">Failed to load content. Check console.</p>`;
        }
      }
    });


    //Content swap with changes in header
    document.addEventListener('DOMContentLoaded', () => {
      const uploadButtons = document.querySelectorAll('.upload-btn');
      uploadButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetPage = button.getAttribute('data-target');
          if (targetPage) {
            window.location.href = targetPage;
          }
        });
      });
    });
