
    window.addEventListener("DOMContentLoaded", function () {
      const tbody = document.querySelector(".announcement-table tbody");
      const overlay = document.getElementById("loading-overlay");

      function showLoading() {
        overlay.classList.add("show");
      }
      function hideLoading() {
        overlay.classList.remove("show");
      }

      function renderTable() {
        tbody.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

        announcements.forEach((item, index) => {
          const dateObj = new Date(item.dateTime);
          const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
          const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

          const row = document.createElement("tr");
          row.classList.add("fade-in");
          row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.details}</td>
            <td><img src="${item.image}" alt="announcement image" style="width:60px; height:auto; border-radius:4px;"></td>
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>
              <a href="admin_announcement_edit.html?index=${index}" class="text-primary me-2 edit-link">Edit</a>
              <a href="#" class="text-danger trash-icon" data-index="${index}">
                <i class="ph ph-trash"></i>
              </a>
            </td>
          `;
          tbody.appendChild(row);
        });

        // Attach delete event
        document.querySelectorAll(".trash-icon").forEach(btn => {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            const index = this.getAttribute("data-index");

            if (confirm("Are you sure you want to delete this announcement?")) {
              let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
              announcements.splice(index, 1);
              localStorage.setItem("announcements", JSON.stringify(announcements));

              // Dispatch storage event to update announcement.html in other tab
              window.dispatchEvent(new StorageEvent("storage", { key: "announcements" }));

              renderTable();
            }
          });
        });

        // Re-render Phosphor icons after dynamic content
        if (window.PhosphorIcons) window.PhosphorIcons.replace();
      }

      // Show loading, simulate delay for smoother UX
      showLoading();
      setTimeout(() => {
        renderTable();
        hideLoading();
      }, 600);

      // 🔥 Auto-update other tabs (announcement.html) when this tab changes localStorage
      window.addEventListener("storage", (e) => {
        if (e.key === "announcements") {
          renderTable();
        }
      });

      // 🔥 Auto-refresh when user returns to this tab
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          renderTable();
        }
      });
    });