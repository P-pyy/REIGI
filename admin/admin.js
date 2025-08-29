
    // SIDEBAR SCRIPT 
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
          window.dispatchEvent(new Event('resize')); 
        });
      }

      // ✅ Logout button
      const logoutBtn = document.querySelector('.logout');
      if (logoutBtn) {
        logoutBtn.style.cursor = "pointer"; // makes it clickable
        logoutBtn.addEventListener('click', () => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "../login_admin.html"; // Redirect to login page
        });
      }
    })
    .catch(error => console.error('Error loading sidebar:', error));

    
    // Line Chart
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan','Mar','May','Jul','Sep','Nov','Dec'],
        datasets: [{
          label: 'Series 1',
          data: [30, 32, 35, 38, 40, 42, 45],
          borderColor: '#0055A5',
          backgroundColor: 'rgba(0, 85, 165, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false
      }
    });

    // Pie Chart
    const devCtx = document.getElementById('deviceChart');
    new Chart(devCtx, {
      type: 'doughnut',
      data: {
        labels: ['Mobile', 'Computer'],
        datasets: [{
          data: [35, 65],
          backgroundColor: ['#0055A5', '#87c3fb']
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
