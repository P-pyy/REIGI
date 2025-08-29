/* ---------------- Load HEAD (shared assets) ---------------- */
fetch('head.html')
  .then(res => res.text())
  .then(html => document.head.insertAdjacentHTML('beforeend', html))
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
  return loadExternalScript('https://unpkg.com/@phosphor-icons/web', 'phosphor-script')
    .then(() => {
      phosphorReady = true;
      if (window.PhosphorIcons?.replace) {
        try { window.PhosphorIcons.replace(); } catch (e) {}
      }
    })
    .catch(err => console.warn('Phosphor script failed to load:', err));
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
    html { scroll-behavior: smooth; }
  `;
  document.head.appendChild(style);
})();

/* ---------------- Load NAVBAR ---------------- */
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    let nav = document.getElementById('navbar-container') || document.createElement('div');
    nav.id = 'navbar-container';
    document.body.insertAdjacentElement('afterbegin', nav);
    nav.innerHTML = data;
    ensurePhosphor().then(() => window.PhosphorIcons?.replace?.());
    attachGlobalDelegates();
  })
  .catch(console.error);

/* ---------------- Load FOOTER ---------------- */
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    let foot = document.getElementById('footer-container') || document.createElement('div');
    foot.id = 'footer-container';
    document.body.insertAdjacentElement('beforeend', foot);
    foot.innerHTML = data;
    ensurePhosphor().then(() => window.PhosphorIcons?.replace?.());
    attachGlobalDelegates();
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

/* Central SPA loader (NO spinner, just fade) */
function loadPage(url, { push = true } = {}) {
  const main = getMainContainer();
  main.classList.add('fade-out');

  ensurePhosphor().finally(() => {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main') || doc.body;
        const newHead = doc.head;

        setTimeout(() => {
          /* --- CLEAN OLD PAGE HEAD --- */
          document.querySelectorAll('head [data-spa-page]').forEach(el => el.remove());

          /* --- ADD NEW PAGE HEAD --- */
          let loadPromises = [];
          if (newHead) {
            Array.from(newHead.children).forEach(el => {
              const tag = el.tagName.toLowerCase();
              const href = el.getAttribute('href');
              const src = el.getAttribute('src');

              if (href || src) {
                const clone = el.cloneNode(true);
                clone.setAttribute('data-spa-page','');

                if (tag === 'link' && clone.rel === 'stylesheet') {
                  loadPromises.push(new Promise(resolve => {
                    clone.onload = () => resolve();
                    clone.onerror = () => resolve();
                  }));
                }
                document.head.appendChild(clone);
              }
            });
          }

          /* --- Wait for stylesheets before replacing --- */
          Promise.all(loadPromises).then(() => {
            main.innerHTML = newMain.innerHTML;

            main.classList.remove('fade-out');
            main.classList.add('fade-in');
            setTimeout(() => main.classList.remove('fade-in'), 300);

            if (push) window.history.pushState({}, '', url);
            if (doc.title) document.title = doc.title;

            attachGlobalDelegates();
            runPageInits(url);

            if (window.PhosphorIcons?.replace) {
              try { window.PhosphorIcons.replace(); } catch (e) {}
            }
          });
        }, 300);
      })
      .catch(console.error);
  });
}

/* Event Delegation */
let delegatesAttached = false;
function attachGlobalDelegates() {
  if (delegatesAttached) return;
  delegatesAttached = true;

  document.addEventListener('click', (e) => {
    const backIcon = e.target.closest('.arrow-left-icon');
    if (backIcon) {
      e.preventDefault();
      loadPage('announcement.html');
      return;
    }

    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href) return;

    const isExternal = /^(https?:)?\/\//i.test(href) || a.target === '_blank';
    if (isExternal) return;

    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (href.endsWith('.html') || href.includes('.html?')) {
      e.preventDefault();
      loadPage(href);
    }
  });

  // ✅ Handle back/forward navigation
  window.addEventListener('popstate', () => {
    const url = location.pathname + location.search;
    loadPage(url, { push: false });
  });
}

/* ---------------- Page Initializers ----------------- */
function runPageInits(url) {
  const path = url.split('?')[0];

  // Announcements index page
  if (path.endsWith('announcement.html')) {
    if (typeof initAnnouncementsIndex !== "function") {
      loadExternalScript('announcement.js', 'announcement-js')
        .then(() => initAnnouncementsIndex?.());
    } else {
      initAnnouncementsIndex();
    }
  }

  // Announcement article page
  if (path.endsWith('announcement_article.html')) {
    if (typeof initAnnouncementArticle !== "function") {
      loadExternalScript('announcement_article.js', 'announcement-article-js')
        .then(() => initAnnouncementArticle?.(url));
    } else {
      initAnnouncementArticle(url);
    }
  }

  // Home page
  if (path.endsWith('home.html') || path.endsWith('index.html')) {
    if (typeof initHome !== "function") {
      loadExternalScript('home.js', 'home-js')
        .then(() => initHome?.());
    } else {
      initHome();
    }
  }
}
