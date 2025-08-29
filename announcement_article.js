
  window.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

    if (id !== null && announcements[id]) {
      const announcement = announcements[id];
      const dateObj = new Date(announcement.dateTime);
      const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

      // Fill in article content
      document.querySelector(".card img").src = announcement.image;
      document.querySelector(".card-title").textContent = announcement.title;
      document.querySelector(".card-subtitle").textContent = formattedDate;
      document.querySelector(".card-text").textContent = announcement.details;
    }

    // 🔹 Fill "Other Announcements"
    const otherWrapper = document.querySelector(".other-announcements-scroll");
    otherWrapper.innerHTML = "";

    announcements.forEach((item, index) => {
      if (index == id) return; // skip the one already displayed

      const dateObj = new Date(item.dateTime);
      const formattedDate = dateObj.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

      const card = document.createElement("div");
      card.classList.add("card", "mb-4", "shadow-sm", "rounded-4", "border-0", "card-2");
      card.innerHTML = `
        <div class="row g-0">
          <div class="col-md-5">
            <img src="${item.image}" class="img-fluid h-100 rounded-start" alt="Announcement">
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h6 class="card-title2 fw-bold announcement-title">${item.title}</h6>
              <p class="card-text small announcement-date">${formattedDate}</p>
              <a href="announcement_article.html?id=${index}" class="text-decoration-none fw-semibold small read-more-2">
                read more <i class="ph-bold ph-arrow-up-right"></i>
              </a>
            </div>
          </div>
        </div>
      `;
      otherWrapper.appendChild(card);
    });
  });

  /* --- announcement_article.html initializer --- */
function initAnnouncementArticle(url) {
  try {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const id = params.get('id');

    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    if (id !== null && announcements[id]) {
      const a = announcements[id];
      const dateObj = new Date(a.dateTime);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: '2-digit', month: '2-digit', day: '2-digit'
      });

      const img = document.querySelector('.card img');
      const title = document.querySelector('.card-title');
      const subtitle = document.querySelector('.card-subtitle');
      const text = document.querySelector('.card-text');
      if (img) img.src = a.image || 'img/CARD-BG.png';
      if (title) title.textContent = a.title || 'Announcement';
      if (subtitle) subtitle.textContent = formattedDate;
      if (text) text.textContent = a.details || '';
    }

    const otherWrapper = document.querySelector('.other-announcements-scroll');
    if (otherWrapper) {
      otherWrapper.innerHTML = '';
      announcements.forEach((item, index) => {
        if (String(index) === String(id)) return;
        const dateObj = new Date(item.dateTime);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          year: '2-digit', month: '2-digit', day: '2-digit'
        });
        const card = document.createElement('div');
        card.className = 'card mb-4 shadow-sm rounded-4 border-0 card-2';
        card.innerHTML = `
          <div class="row g-0">
            <div class="col-md-5">
              <img src="${item.image}" class="img-fluid h-100 rounded-start" alt="Announcement">
            </div>
            <div class="col-md-7">
              <div class="card-body">
                <h6 class="card-title2 fw-bold announcement-title">${item.title}</h6>
                <p class="card-text small announcement-date">${formattedDate}</p>
                <a href="announcement_article.html?id=${index}" class="text-decoration-none fw-semibold small read-more-2">
                  read more <i class="ph-bold ph-arrow-up-right"></i>
                </a>
              </div>
            </div>
          </div>
        `;
        otherWrapper.appendChild(card);
      });
    }

    window.PhosphorIcons?.replace?.();
  } catch (err) {
    console.error('initAnnouncementArticle error:', err);
  }
}

