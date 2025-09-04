//  Script to load sidebar 
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

      // Add event listeners after sidebar content is loaded
      const toggleBtn = document.querySelector('.toggle-btn');
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      const mainHeader = document.querySelector('.main-header');
      if (toggleBtn && sidebar && mainContent && mainHeader) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('small-sidebar');
          // Update main content and header
          const isSmall = sidebar.classList.contains('small-sidebar');
          mainContent.style.marginLeft = isSmall ? '80px' : '250px';
          mainHeader.style.width = isSmall ? 'calc(100% - 80px)' : 'calc(100% - 250px)';
          mainHeader.style.marginLeft = isSmall ? '80px' : '250px';
          window.dispatchEvent(new Event('resize')); 
        });
      }
    })
    .catch(error => console.error('Error loading sidebar:', error));

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

