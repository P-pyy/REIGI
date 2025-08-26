/* ---------------- Load HEAD (shared assets) ---------------- */
fetch('head.html')
  .then(res => res.text())
  .then(html => {
    document.head.insertAdjacentHTML('beforeend', html);
  })
  .catch(console.error);

/* ----------------- Load external script helper ----------------- */
function loadExternalScript(src, id) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src;
    s.defer = true;
    s.onload = () => resolve(s);
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });
}

/* ----------------- Ensure Phosphor Icons are loaded ----------------- */
let phosphorReady = false;
function ensurePhosphor() {
  if (phosphorReady) return Promise.resolve();
  // load and mark ready
  return loadExternalScript('https://unpkg.com/@phosphor-icons/web', 'phosphor-script')
    .then(() => {
      phosphorReady = true;
      // replace any existing placeholders (if API available)
      if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
        try { window.PhosphorIcons.replace(); } catch (e) { /* ignore */ }
      }
    })
    .catch(err => {
      console.warn('Phosphor script failed to load:', err);
    });
}

/* Inject minimal SPA fade styles once */
(function ensureSpaStyles(){
  if (document.getElementById('spa-fade-style')) return;
  const style = document.createElement('style');
  style.id = 'spa-fade-style';
  style.textContent = `
    main, #main-container { opacity: 1; transition: opacity .3s ease; }
    .fade-out { opacity: 0 !important; }
    .fade-in  { opacity: 1 !important; }
    html { scroll-behavior: smooth; } /* smooth #anchor scrolls */
  `;
  document.head.appendChild(style);
})();

/* ---------------- Load NAVBAR ---------------- */
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    let nav = document.getElementById('navbar-container');
    if (!nav) {
      nav = document.createElement('div');
      nav.id = 'navbar-container';
      document.body.insertAdjacentElement('afterbegin', nav);
    }
    nav.innerHTML = data;

    // ensure phosphor is loaded then replace icons in navbar
    ensurePhosphor().then(() => {
      if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
        try { window.PhosphorIcons.replace(); } catch (e) {}
      }
    });

    attachGlobalDelegates();   // set up SPA link handling
  })
  .catch(console.error);

/* ---------------- Load FOOTER ---------------- */
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    let foot = document.getElementById('footer-container');
    if (!foot) {
      foot = document.createElement('div');
      foot.id = 'footer-container';
      document.body.insertAdjacentElement('beforeend', foot);
    }
    foot.innerHTML = data;

    // ensure phosphor is loaded then replace icons in footer
    ensurePhosphor().then(() => {
      if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
        try { window.PhosphorIcons.replace(); } catch (e) {}
      }
    });

    attachGlobalDelegates();   // set up SPA link handling
  })
  .catch(console.error);

/* --------------- Helpers ------------------- */
function getMainContainer() {
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.id = 'main-container';
    const footer = document.getElementById('footer-container');
    document.body.insertBefore(main, footer || null);
  }
  return main;
}

/* Central SPA loader with fade + history + title + page init */
function loadPage(url, { push = true } = {}) {
  const main = getMainContainer();
  main.classList.add('fade-out');

  // ensure phosphor is loaded (so if the new page contains <i class="ph ..."> we can render)
  ensurePhosphor().finally(() => {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        // Parse full document to extract <main> and <title>
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main') || doc.body;

        setTimeout(() => {
          main.innerHTML = newMain.innerHTML;
          main.classList.remove('fade-out');
          main.classList.add('fade-in');
          setTimeout(() => main.classList.remove('fade-in'), 300);

          // Update URL + Title
          if (push) window.history.pushState({}, '', url);
          if (doc.title) document.title = doc.title;

          // Re-attach SPA delegates for newly injected links/buttons
          attachGlobalDelegates();

          // Run page-specific initializers
          runPageInits(url);

          // Re-render phosphor icons inside the newly injected main
          if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
            try { window.PhosphorIcons.replace(); } catch (e) {}
          }
        }, 300);
      })
      .catch(console.error);
  });
}

/* Event delegation: handle ALL clicks we care about in ONE place */
let delegatesAttached = false;
function attachGlobalDelegates() {
  if (delegatesAttached) return;
  delegatesAttached = true;

  document.addEventListener('click', (e) => {
    const main = getMainContainer();

    // Back-arrow icon in article page (uses class .arrow-left-icon)
    const backIcon = e.target.closest('.arrow-left-icon');
    if (backIcon) {
      e.preventDefault();
      loadPage('announcement.html');
      return;
    }

    // Anchor links (nav, footer, read-more, any link in content)
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href) return;

    // External links or new tab: let browser handle it
    const isExternal = /^(https?:)?\/\//i.test(href) || a.target === '_blank';
    if (isExternal) return;

    // In-page anchors: smooth scroll (CSS handles it, but prevent hard jump)
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Handle .html pages (with or without query string like ?id=3)
    if (href.endsWith('.html') || href.includes('.html?')) {
      e.preventDefault();
      loadPage(href);
      return;
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const url = location.pathname + location.search;
    loadPage(url, { push: false });
  });
}

/* ---------------- Page Initializers ----------------- */
function runPageInits(url) {
  // Normalize URL (remove origin)
  const path = url.split('?')[0];

  if (path.endsWith('announcement.html')) {
    initAnnouncementsIndex();
  }

  if (path.endsWith('announcement_article.html')) {
    initAnnouncementArticle(url);
  }

  // Add other page initializers here as needed...
}

/* --- announcement.html initializer (build grid from localStorage) --- */
function initAnnouncementsIndex() {
  try {
    const grid = document.querySelector('.announcement-grid');
    if (!grid) return;

    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    grid.innerHTML = '';

    announcements.forEach((item, index) => {
      const dateObj = new Date(item.dateTime);
      const formattedDate = dateObj.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
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

    if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
      try { window.PhosphorIcons.replace(); } catch(e){}
    }
  } catch (err) {
    console.error('initAnnouncementsIndex error:', err);
  }
}

/* --- announcement_article.html initializer (fill main card + other list) --- */
function initAnnouncementArticle(url) {
  try {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const id = params.get('id');

    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    if (id !== null && announcements[id]) {
      const a = announcements[id];
      const dateObj = new Date(a.dateTime);
      const formattedDate = dateObj.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });

      // Fill main card
      const img = document.querySelector('.card img');
      const title = document.querySelector('.card-title');
      const subtitle = document.querySelector('.card-subtitle');
      const text = document.querySelector('.card-text');
      if (img) img.src = a.image || 'img/CARD-BG.png';
      if (title) title.textContent = a.title || 'Announcement';
      if (subtitle) subtitle.textContent = formattedDate;
      if (text) text.textContent = a.details || '';
    }

    // Fill "Other Announcements"
    const otherWrapper = document.querySelector('.other-announcements-scroll');
    if (otherWrapper) {
      otherWrapper.innerHTML = '';
      announcements.forEach((item, index) => {
        if (String(index) === String(id)) return;
        const dateObj = new Date(item.dateTime);
        const formattedDate = dateObj.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
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

    if (window.PhosphorIcons && typeof window.PhosphorIcons.replace === 'function') {
      try { window.PhosphorIcons.replace(); } catch(e){}
    }
  } catch (err) {
    console.error('initAnnouncementArticle error:', err);
  }
}
