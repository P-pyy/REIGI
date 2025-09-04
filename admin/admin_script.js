/* ---------------- Load Admin HEAD (shared assets) ---------------- */
fetch('admin_head.html')
  .then(res => res.text())
  .then(html => document.head.insertAdjacentHTML('beforeend', html))
  .catch(console.error);