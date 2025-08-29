/* --- announcement.html initializer --- */
function initAnnouncementsIndex() {
  try {
    const grid = document.querySelector('.announcement-grid');
    if (!grid) return;

    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];

    // ✅ If no announcements, keep default UI (do nothing)
    if (!announcements.length) {
      console.log("No announcements found, showing default placeholders.");
      return;
    }

    // Otherwise, replace placeholders with dynamic announcements
    grid.innerHTML = '';

    announcements.forEach((item, index) => {
      const dateObj = new Date(item.dateTime);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      });

      const card = document.createElement('article');
      card.className = 'announcement-card';
      card.innerHTML = `
        <img src="${item.image}" alt="Announcement Image" />
        <div class="announcement-text">
          <h2>${item.title}</h2>
          <p class="date">${formattedDate}</p>
          <p class="description">${(item.details || '').substring(0, 150)}...</p>
          <a href="announcement_article.html?id=${index}" class="read-more">read more</a>
        </div>
      `;
      grid.appendChild(card);
    });

    // Refresh icons if needed
    window.PhosphorIcons?.replace?.();

  } catch (err) {
    console.error('initAnnouncementsIndex error:', err);
  }
}
