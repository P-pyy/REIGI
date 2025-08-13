// Load head
fetch('head.html')
  .then(res => res.text())
  .then(html => document.head.insertAdjacentHTML('beforeend', html))
  .catch(console.error);

// Load navbar
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    let nav = document.getElementById('navbar-container');
    if(!nav) {
      nav = document.createElement('div');
      nav.id = 'navbar-container';
      document.body.insertAdjacentElement('afterbegin', nav);
    }
    nav.innerHTML = data;
  })
  .catch(console.error);

// Load footer
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    let foot = document.getElementById('footer-container');
    if(!foot) {
      foot = document.createElement('div');
      foot.id = 'footer-container';
      document.body.insertAdjacentElement('beforeend', foot);
    }
    foot.innerHTML = data;
  })
  .catch(console.error);

