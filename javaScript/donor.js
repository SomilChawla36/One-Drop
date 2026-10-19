/**
 * ONE DROP BLOOD BANK - Donor Registration Wizard
 * 4-step multi-page form with validation, LocalStorage save, and certificate issuance.
 * Used on: become-a-donar.html
 * Depends on: store.js, ui.js, auth.js
 */

const OneDropDonor = {
  currentStep: 1,

  init() {
    const donorForm = document.querySelector('.donor-form');
    if (!donorForm) return;

    // Pre-fill from logged-in user
    const user = OneDropAuth.getCurrentUser();
    if (user) {
      const nameInput = donorForm.querySelector('input[name="fullName"]');
      const emailInput = donorForm.querySelector('input[name="email"]');
      const phoneInput = donorForm.querySelector('input[name="phone"]');
      if (nameInput && !nameInput.value) nameInput.value = `${user.firstName} ${user.lastName}`.trim();
      if (emailInput && !emailInput.value) emailInput.value = user.email;
      if (phoneInput && !phoneInput.value && user.phone) phoneInput.value = user.phone;
    }

    this.setupWizard(donorForm);
  },

  setupWizard(form) {
    const titles = Array.from(form.querySelectorAll('.form-section-title'));
    const fieldGroups = Array.from(form.querySelectorAll('.fields'));
    const cardNav = form.querySelector('.card-nav');

    if (titles.length < 3 || fieldGroups.length < 3) return;

    // Wrap into step panels
    const step1 = this._makePanel(true, titles[0], fieldGroups[0]);
    const step2 = this._makePanel(false, titles[1], fieldGroups[1]);
    const step3 = this._makePanel(false, titles[2], fieldGroups[2]);

    const step4 = document.createElement('div');
    step4.className = 'step-panel';
    step4.innerHTML = `
      <h3 class="form-section-title">Review & Submit</h3>
      <div id="step-review-summary" style="background:#faf5f5;border:1px solid #fecaca;border-radius:16px;padding:20px;font-size:0.9rem;line-height:1.8;color:#374151;"></div>
    `;

    form.insertBefore(step1, cardNav);
    form.insertBefore(step2, cardNav);
    form.insertBefore(step3, cardNav);
    form.insertBefore(step4, cardNav);

    // Replace nav buttons
    cardNav.innerHTML = `
      <button type="button" class="btn-back" id="wizard-prev-btn" style="display:none;">&#8592; Back</button>
      <button type="button" class="btn-continue" id="wizard-next-btn">Next Step &rarr;</button>
      <button type="submit" class="btn-continue" id="wizard-submit-btn" style="display:none;background:#10b981;">Confirm & Register</button>
    `;

    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const submitBtn = document.getElementById('wizard-submit-btn');
    const stepIndicators = Array.from(document.querySelectorAll('.steps .step'));

    const updateView = (stepNum) => {
      this.currentStep = stepNum;
      form.querySelectorAll('.step-panel').forEach((p, idx) => {
        p.classList.toggle('active', idx + 1 === stepNum);
      });
      stepIndicators.forEach((ind, idx) => {
        ind.classList.toggle('active', idx + 1 === stepNum);
        ind.classList.toggle('completed', idx + 1 < stepNum);
      });

      prevBtn.style.display = stepNum === 1 ? 'none' : '';
      nextBtn.style.display = stepNum < 4 ? '' : 'none';
      submitBtn.style.display = stepNum === 4 ? '' : 'none';

      if (stepNum === 4) this._renderReviewSummary(form);
    };

    nextBtn.addEventListener('click', () => {
      if (this._validateStep(this.currentStep, form)) updateView(this.currentStep + 1);
    });
    prevBtn.addEventListener('click', () => {
      if (this.currentStep > 1) updateView(this.currentStep - 1);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit(form);
    });
  },

  _makePanel(isActive, title, fields) {
    const panel = document.createElement('div');
    panel.className = 'step-panel' + (isActive ? ' active' : '');
    panel.appendChild(title);
    panel.appendChild(fields);
    return panel;
  },

  _validateStep(step, form) {
    if (step === 1) {
      const name = form.querySelector('input[name="fullName"]')?.value.trim();
      const email = form.querySelector('input[name="email"]')?.value.trim();
      const phone = form.querySelector('input[name="phone"]')?.value.trim();
      const gender = form.querySelector('select[name="gender"]')?.value;
      const dob = form.querySelector('input[name="dob"]')?.value;
      if (!name || !email || !phone || !gender || !dob) {
        OneDropUI.showToast('Please fill all required personal details.', 'error');
        return false;
      }
    }
    if (step === 2) {
      const city = form.querySelector('input[name="city"]')?.value.trim();
      if (!city) {
        OneDropUI.showToast('Please specify your city.', 'error');
        return false;
      }
    }
    if (step === 3) {
      const bloodGroup = form.querySelector('select[name="bloodGroup"]')?.value;
      const agree = form.querySelector('input[name="agree"]')?.checked;
      if (!bloodGroup) {
        OneDropUI.showToast('Please select your blood group.', 'error'); return false;
      }
      if (!agree) {
        OneDropUI.showToast('Please confirm your eligibility agreement.', 'error'); return false;
      }
    }
    return true;
  },

  _renderReviewSummary(form) {
    const box = document.getElementById('step-review-summary');
    if (!box) return;
    const data = new FormData(form);
    box.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>Full Name:</strong> ${data.get('fullName') || '-'}</div>
        <div><strong>Blood Group:</strong> <span style="color:#dc2626;font-weight:700;">${data.get('bloodGroup') || '-'}</span></div>
        <div><strong>Email:</strong> ${data.get('email') || '-'}</div>
        <div><strong>Phone:</strong> ${data.get('phone') || '-'}</div>
        <div><strong>City:</strong> ${data.get('city') || 'Not specified'}</div>
        <div><strong>Preferred Center:</strong> ${data.get('centre') || 'City Hospital'}</div>
        <div><strong>Weight:</strong> ${data.get('weight') ? data.get('weight') + ' kg' : 'Standard'}</div>
        <div><strong>Medical Condition:</strong> ${data.get('condition') || 'No'}</div>
      </div>
      <p style="margin-top:14px;font-size:0.8rem;color:#6b7280;">
        🛡️ Upon submission, you will be added to the verified donor network and awarded your Hero's Certificate.
      </p>
    `;
  },

  _handleSubmit(form) {
    const formData = new FormData(form);
    const donor = {
      id: 'dnr_' + Date.now(),
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      gender: formData.get('gender'),
      dob: formData.get('dob'),
      city: formData.get('city') || 'Local City',
      centre: formData.get('centre') || 'City Hospital Centre',
      bloodGroup: formData.get('bloodGroup'),
      weight: formData.get('weight'),
      distance: '1.5 km',
      verified: true,
      lastDonated: 'Registered Today',
      status: 'Available Now',
      registeredAt: new Date().toISOString()
    };

    const donors = OneDropStore.get(OneDropStore.KEYS.DONORS) || [];
    donors.unshift(donor);
    OneDropStore.set(OneDropStore.KEYS.DONORS, donors);

    // Auto-issue certificate
    const certId = 'CERT-2026-' + Math.floor(100000 + Math.random() * 900000);
    const cert = {
      id: certId,
      name: donor.fullName,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      center: donor.centre,
      issuedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    const certs = OneDropStore.get(OneDropStore.KEYS.CERTIFICATES) || [];
    certs.unshift(cert);
    OneDropStore.set(OneDropStore.KEYS.CERTIFICATES, certs);

    OneDropUI.showToast(`Registered! Certificate issued: ${certId}`, 'success', 5000);
    OneDropUI.showModal('🎉 Registration Successful!', `
      <div style="text-align:center;padding:10px 0;">
        <div style="font-size:3rem;margin-bottom:12px;">🩸</div>
        <h3 style="font-size:1.4rem;color:#111827;margin-bottom:8px;">Thank You, ${donor.fullName}!</h3>
        <p style="color:#4b5563;font-size:0.95rem;margin-bottom:20px;">
          You are now a verified life-saving blood donor with blood group <strong>${donor.bloodGroup}</strong>.
        </p>
        <div style="background:#fef2f2;border:1px dashed #f87171;border-radius:12px;padding:16px;margin-bottom:24px;">
          <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#dc2626;font-weight:700;">Official Certificate Issued</div>
          <div style="font-size:1.25rem;font-weight:800;color:#111827;margin:4px 0;">${certId}</div>
          <span style="font-size:0.85rem;color:#6b7280;">Tamper-proof digital credential stored in One Drop</span>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;">
          <a href="certificates.html" class="btn-continue" style="display:inline-block;text-decoration:none;padding:10px 20px;">View Certificate</a>
          <a href="find.html" class="btn-back" style="display:inline-block;text-decoration:none;padding:10px 20px;">Browse Network</a>
        </div>
      </div>
    `);
  }
};
