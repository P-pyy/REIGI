//  <!-- Load Sidebar Script -->
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
    })
    .catch(error => console.error('Error loading sidebar:', error));

// <!-- Toggle Script -->
  const faqGrid = document.getElementById("faq-grid");

  document.querySelectorAll(".card-button").forEach(button => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");

      if (target) {
        faqGrid.classList.add("d-none");

        document.querySelectorAll("#enrollment-section, #document-request-section, #graduation-clearance-section")
          .forEach(sec => sec.classList.add("d-none"));

        document.getElementById(target).classList.remove("d-none");
      }
    });
  });

//   Table Function


    document.addEventListener("DOMContentLoaded", function() {
      const tbody = document.querySelector(".announcement-table tbody");
      const overlay = document.getElementById("loading-overlay");

      function showLoading() { overlay.classList.add("show"); }
      function hideLoading() { overlay.classList.remove("show"); }

      function renderTable() {
        tbody.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

        announcements.forEach((item, index) => {
          const dateObj = new Date(item.dateTime);
          const formattedDateTime = dateObj.toLocaleString("en-US", { year:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:true });

          const row = document.createElement("tr");
          row.classList.add("fade-in");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.title}</td>
            <td>${item.details}</td>
            <td>${item.questionDetails || ""}</td>
            <td><img src="${item.image}" alt="announcement image" style="width:60px; height:auto; border-radius:4px;"></td>
            <td>${formattedDateTime}</td>
            <td>
              <a href="admin_announcement_edit.html?index=${index}" class="text-primary me-2 edit-link">Edit</a>
              <a href="#" class="text-danger trash-icon" data-index="${index}">
                <i class="ph ph-trash"></i>
              </a>
            </td>
          `;
          tbody.appendChild(row);
        });

        // Attach delete events
        document.querySelectorAll(".trash-icon").forEach(btn => {
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            const index = this.dataset.index;
            if(confirm("Are you sure you want to delete this announcement?")) {
              let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
              announcements.splice(index, 1);
              localStorage.setItem("announcements", JSON.stringify(announcements));
              renderTable();
            }
          });
        });

        // Render Phosphor icons
        if(window.PhosphorIcons) window.PhosphorIcons.replace();
      }

      showLoading();
      setTimeout(() => { renderTable(); hideLoading(); }, 300);

      // Auto-update when localStorage changes
      window.addEventListener("storage", e => { if(e.key === "announcements") renderTable(); });
      document.addEventListener("visibilitychange", () => { if(!document.hidden) renderTable(); });
    });
