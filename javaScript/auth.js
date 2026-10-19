/**
 * ONE DROP BLOOD BANK - Auth & Navbar Controller
 * Handles Sign Up, Sign In, Session management, and dynamic navbar state.
 * Depends on: store.js, ui.js
 */

const OneDropAuth = {
  getCurrentUser() {
    return OneDropStore.get(OneDropStore.KEYS.CURRENT_USER);
  },

  setCurrentUser(user) {
    OneDropStore.set(OneDropStore.KEYS.CURRENT_USER, user);
  },

  logout() {
    localStorage.removeItem(OneDropStore.KEYS.CURRENT_USER);
    OneDropUI.showToast('You have been signed out successfully.', 'info');
    setTimeout(() => window.location.reload(), 800);
  },

  /** Updates navbar across ALL pages to reflect current login state */
  updateNavbar() {
    const user = this.getCurrentUser();
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const existingUserItem = navLinks.querySelector('.nav-user-item');
    if (existingUserItem) existingUserItem.remove();

    const loginLi = Array.from(navLinks.querySelectorAll('li')).find(li => {
      const a = li.querySelector('a');
      return a && (a.getAttribute('href') === 'login.html' || a.textContent.includes('Sign In'));
    });
    const signupLi = Array.from(navLinks.querySelectorAll('li')).find(li => {
      const a = li.querySelector('a');
      return a && (a.getAttribute('href') === 'signup.html' || a.textContent.includes('Sign Up'));
    });

    if (user) {
      if (loginLi) loginLi.style.display = 'none';
      if (signupLi) signupLi.style.display = 'none';

      const userLi = document.createElement('li');
      userLi.className = 'nav-user-item';
      userLi.innerHTML = `
        <div class="nav-user-badge" title="${user.email}">
          <span class="nav-user-avatar">${(user.firstName || 'U')[0].toUpperCase()}</span>
          <span>Hi, ${user.firstName || 'Hero'}</span>
        </div>
        <button class="btn-nav-logout" id="od-btn-logout">Sign Out</button>
      `;
      navLinks.appendChild(userLi);

      document.getElementById('od-btn-logout')?.addEventListener('click', () => OneDropAuth.logout());
    } else {
      if (loginLi) loginLi.style.display = '';
      if (signupLi) signupLi.style.display = '';
    }
  },

  /** Mobile hamburger toggle – used on all pages */
  setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
      navLinks.querySelectorAll('a, button').forEach(link =>
        link.addEventListener('click', () => navLinks.classList.remove('open'))
      );
    }
  },

  /** Sign-Up page logic */
  initSignupPage() {
    const form = document.querySelector('.auth-form');
    const captchaCodeBox = document.querySelector('.captcha-code');
    if (!form || !document.getElementById('signup-first-name')) return;

    if (captchaCodeBox) {
      captchaCodeBox.id = 'signup-captcha-code';
      OneDropUI.generateCaptcha('signup-captcha-code');

      const refreshBtn = document.createElement('button');
      refreshBtn.type = 'button';
      refreshBtn.className = 'captcha-refresh-btn';
      refreshBtn.innerHTML = '🔄 Refresh';
      refreshBtn.title = 'Refresh Captcha';
      refreshBtn.addEventListener('click', () => OneDropUI.generateCaptcha('signup-captcha-code'));
      captchaCodeBox.parentNode.insertBefore(refreshBtn, captchaCodeBox.nextSibling);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = document.getElementById('signup-first-name').value.trim();
      const lastName = document.getElementById('signup-last-name').value.trim();
      const email = document.getElementById('signup-email').value.trim().toLowerCase();
      const phone = document.getElementById('signup-phone').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      const captchaInput = document.getElementById('signup-captcha').value.trim();
      const termsChecked = document.getElementById('signup-terms').checked;
      const expectedCaptcha = captchaCodeBox ? captchaCodeBox.dataset.code : '';

      if (!firstName || !lastName || !email || !password) {
        OneDropUI.showToast('Please fill in all required fields.', 'error'); return;
      }
      if (password !== confirmPassword) {
        OneDropUI.showToast('Passwords do not match. Please verify.', 'error'); return;
      }
      if (password.length < 6) {
        OneDropUI.showToast('Password must be at least 6 characters long.', 'error'); return;
      }
      if (captchaCodeBox && captchaInput.toUpperCase() !== expectedCaptcha.toUpperCase()) {
        OneDropUI.showToast('Incorrect Captcha code. Try again.', 'error');
        OneDropUI.generateCaptcha('signup-captcha-code'); return;
      }
      if (!termsChecked) {
        OneDropUI.showToast('Please agree to the terms and conditions.', 'error'); return;
      }

      const users = OneDropStore.get(OneDropStore.KEYS.USERS) || [];
      if (users.find(u => u.email === email)) {
        OneDropUI.showToast('An account with this email already exists. Please Sign In.', 'error'); return;
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        firstName, lastName, email, phone, password,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      OneDropStore.set(OneDropStore.KEYS.USERS, users);
      OneDropAuth.setCurrentUser(newUser);

      OneDropUI.showToast(`Welcome to One Drop, ${firstName}! Account created.`, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    });
  },

  /** Sign-In page logic */
  initLoginPage() {
    const form = document.querySelector('.auth-form');
    const captchaCodeBox = document.querySelector('.captcha-code');
    if (!form || !document.getElementById('signin-email')) return;

    if (captchaCodeBox) {
      captchaCodeBox.id = 'signin-captcha-code';
      OneDropUI.generateCaptcha('signin-captcha-code');

      const refreshBtn = document.createElement('button');
      refreshBtn.type = 'button';
      refreshBtn.className = 'captcha-refresh-btn';
      refreshBtn.innerHTML = '🔄 Refresh';
      refreshBtn.addEventListener('click', () => OneDropUI.generateCaptcha('signin-captcha-code'));
      captchaCodeBox.parentNode.insertBefore(refreshBtn, captchaCodeBox.nextSibling);
    }

    // 1-click demo helper
    const demoHelper = document.createElement('button');
    demoHelper.type = 'button';
    demoHelper.className = 'demo-helper-btn';
    demoHelper.textContent = '⚡ Click to Fill Demo Account (demo@onedrop.org)';
    demoHelper.addEventListener('click', () => {
      document.getElementById('signin-email').value = 'demo@onedrop.org';
      document.getElementById('signin-password').value = 'demo123';
      if (captchaCodeBox) {
        document.getElementById('signin-captcha').value = captchaCodeBox.dataset.code;
      }
      OneDropUI.showToast('Demo credentials filled!', 'info');
    });
    form.parentNode.insertBefore(demoHelper, form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('signin-email').value.trim().toLowerCase();
      const password = document.getElementById('signin-password').value;
      const captchaInput = document.getElementById('signin-captcha').value.trim();
      const rememberMe = document.getElementById('remember-me')?.checked;
      const expectedCaptcha = captchaCodeBox ? captchaCodeBox.dataset.code : '';

      if (captchaCodeBox && captchaInput.toUpperCase() !== expectedCaptcha.toUpperCase()) {
        OneDropUI.showToast('Invalid Captcha code. Please try again.', 'error');
        OneDropUI.generateCaptcha('signin-captcha-code'); return;
      }

      const users = OneDropStore.get(OneDropStore.KEYS.USERS) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        OneDropUI.showToast('Invalid email or password. Please check your credentials.', 'error'); return;
      }

      OneDropAuth.setCurrentUser(user);
      if (rememberMe) {
        localStorage.setItem('onedrop_remembered_email', email);
      } else {
        localStorage.removeItem('onedrop_remembered_email');
      }

      OneDropUI.showToast(`Welcome back, ${user.firstName}!`, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    });

    // Pre-fill remembered email
    const remembered = localStorage.getItem('onedrop_remembered_email');
    if (remembered) {
      document.getElementById('signin-email').value = remembered;
      const cb = document.getElementById('remember-me');
      if (cb) cb.checked = true;
    }
  }
};
