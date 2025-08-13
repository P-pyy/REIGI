// login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBuQHu8PgSNBYivZSw07tgeKpIVWcBxang",
  authDomain: "reigi-b78a6.firebaseapp.com",
  projectId: "reigi-b78a6",
  storageBucket: "reigi-b78a6.appspot.com",
  messagingSenderId: "601396882172",
  appId: "1:601396882172:web:87b792abab906d2e864579"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login form submission
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "admin.html";
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
});

// Show password toggle
document.getElementById('showPassword').addEventListener('change', function () {
  document.getElementById('password').type = this.checked ? 'text' : 'password';
});
