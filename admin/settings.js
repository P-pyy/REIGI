    // <!-- Load Sidebar -->

      fetch("sidebar.html")
        .then((res) => res.text())
        .then((data) => {
          document.getElementById("sidebar-container").innerHTML = data;
          const currentPage = window.location.pathname.split("/").pop();
          document.querySelectorAll(".menu li a").forEach((link) => {
            if (link.getAttribute("href") === currentPage)
              link.classList.add("active");
          });
        })
        .catch(console.error);


    // <!-- Swap Forms JS -->

      const swapLinks = document.querySelectorAll(".swap-link");
      const forms = document.querySelectorAll(".form-section");
      const backBtns = document.querySelectorAll(".back-btn");
      const closeBtns = document.querySelectorAll(".close-btn");
      const sectionsToHide = [
        document.getElementById("security-settings"),
        document.getElementById("account-history"),
      ];

      // Swap to forms
      swapLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.dataset.target;

          // Hide security + account history
          sectionsToHide.forEach((sec) => (sec.style.display = "none"));

          // Hide all forms, show selected
          forms.forEach((f) => (f.style.display = "none"));
          document.getElementById(targetId).style.display = "block";
        });
      });

      // Back buttons
      backBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          forms.forEach((f) => (f.style.display = "none"));
          sectionsToHide.forEach((sec) => (sec.style.display = "block"));
        });
      });

      // Close buttons (same as back)
      closeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          forms.forEach((f) => (f.style.display = "none"));
          sectionsToHide.forEach((sec) => (sec.style.display = "block"));
        });
      });

      // Change Password Form logic
      const passwordForm = document.getElementById("changePasswordForm");
      passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentPass = passwordForm.currentPassword.value.trim();
        const newPass = passwordForm.newPassword.value.trim();
        const reenterPass = passwordForm.reenterNewPassword.value.trim();

        if (newPass !== reenterPass) {
          alert("New passwords do not match. Please re-enter.");
          passwordForm.reenterNewPassword.focus();
          return;
        }

        if (newPass.length < 8) {
          alert("New password must be at least 8 characters long.");
          passwordForm.newPassword.focus();
          return;
        }

        alert("Password change submitted successfully!");
        passwordForm.reset();
      });

      // Change Email Form logic
      const emailForm = document.getElementById("changeEmailForm");
      emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentEmail = emailForm.currentEmail.value.trim();
        const newEmail = emailForm.newEmail.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(currentEmail)) {
          alert("Please enter a valid current email address.");
          emailForm.currentEmail.focus();
          return;
        }

        if (!emailPattern.test(newEmail)) {
          alert("Please enter a valid new email address.");
          emailForm.newEmail.focus();
          return;
        }

        if (currentEmail === newEmail) {
          alert(
            "The new email address must be different from the current one."
          );
          emailForm.newEmail.focus();
          return;
        }

        alert(
          "Email change submitted successfully!\nCurrent Email: " +
            currentEmail +
            "\nNew Email: " +
            newEmail
        );
        emailForm.reset();
      });
