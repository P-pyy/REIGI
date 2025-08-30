/* ---------------- Load HEAD (shared assets) ---------------- */
fetch('head.html')
  .then(res => res.text())
  .then(html => document.head.insertAdjacentHTML('beforeend', html))
  .catch(console.error);

/* ----------------- Load external script helper ----------------- */
function loadExternalScript(src, id) {
  return new Promise((resolve, reject) => {
    const old = document.getElementById(id);
    if (old) old.remove();

    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src + `?v=${Date.now()}`; // cache-buster
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

/* ---------------- Load NAVBAR ---------------- */
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    let nav = document.getElementById('navbar-container') || document.createElement('div');
    nav.id = 'navbar-container';
    document.body.insertAdjacentElement('afterbegin', nav);
    nav.innerHTML = data;
    ensurePhosphor().then(() => window.PhosphorIcons?.replace?.());
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
  })
  .catch(console.error);

/* ---------------- Browser reload = fresh data ---------------- */
window.addEventListener("beforeunload", () => {
  sessionStorage.clear();
});
