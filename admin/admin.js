const SUPABASE_URL = "https://oeeqegpgmobbuhaadrhr.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXFlZ3BnbW9iYnVoYWFkcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwNzEsImV4cCI6MjA3MjA2MDA3MX0.M-pplPUdj21v2Fb5aLmmbE94gDGCfslksAI8fJca2cE";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  (async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Not logged in → redirect back to login
      window.location.href = "login.html";
    }
  })();

 
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
      const rowSumCards = document.querySelector('.row-sum-cards');
      const chartContainer = document.querySelector('.chart-container');
      const faqCard = document.querySelector('.faq-card');

      if (toggleBtn && sidebar && mainContent && mainHeader && rowSumCards && chartContainer && faqCard) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('small-sidebar');
          mainContent.classList.toggle('adjusted');
          mainHeader.classList.toggle('adjusted');
          rowSumCards.classList.toggle('adjusted');
          chartContainer.classList.toggle('adjusted');
          faqCard.classList.toggle('adjusted');
          window.dispatchEvent(new Event('resize')); 
        });
      }
    })
    .catch(error => console.error('Error loading sidebar:', error));

    // Line Chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
        datasets: [{
          label: 'Series 1',
          data: [0, 10, 20, 30, 40, 50, 50],
          borderColor: '#0055A5',
          backgroundColor: 'rgba(0, 85, 165, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 0,
            right: 30,
            top: 30,
            bottom: 0
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            },
            ticks: {
              align: 'start'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Active users'
            },
            ticks: {
              stepSize: 10,
              min: 0,
              max: 50
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    const legendContainer = document.getElementById('customLegend');
    const dataset = chart.data.datasets[0];
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <span class="legend-circle"></span>
      <span class="legend-text">${dataset.label}</span>
    `;
    legendContainer.appendChild(legendItem);

    // Pie Chart
    const devCtx = document.getElementById('deviceChart');
    new Chart(devCtx, {
      type: 'doughnut',
      data: {
        labels: ['Mobile', 'Computer'],
        datasets: [{
          data: [35, 65],
          backgroundColor: ['#CDE4FF', '#0055A5'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '50%',
        plugins: {
          legend: {
            display: false
          }
        },
        maintainAspectRatio: false
      }
    });

    document.addEventListener('DOMContentLoaded', function() {
      const labels = document.querySelectorAll('.percentage-labels p');
      labels.forEach(p => {
        const text = p.textContent.trim();
        const [label, percent] = text.split(' ');
        p.innerHTML = `<span class="label">${label}</span><span class="percent">${percent}</span>`;
      });
    });
