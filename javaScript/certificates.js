/**
 * ONE DROP BLOOD BANK - Certificates Hub
 * Lookup, Generate, and Verify digital donation certificates.
 * Used on: certificates.html
 * Depends on: store.js, ui.js, auth.js
 */

const OneDropCertificates = {
  init() {
    if (!document.querySelector('.card .tabs')) return;
    this._removeStaticBadges();
    this._initLookup();
    this._initGenerate();
    this._initVerify();
  },

  _removeStaticBadges() {
    document.querySelectorAll('.note-box').forEach(box => box.remove());
  },

  _initLookup() {
    const panel = document.getElementById('panel-my');
    if (!panel) return;

    const nameInput = document.getElementById('lookup-name');
    const emailInput = document.getElementById('lookup-email');
    const lookupBtn = panel.querySelector('button.btn');
    const certListContainer = panel.querySelector('.mycert-list');

    // Auto-fill from session
    const user = OneDropAuth.getCurrentUser();
    if (user && emailInput && !emailInput.value) {
      emailInput.value = user.email;
      if (nameInput) nameInput.value = `${user.firstName} ${user.lastName}`.trim();
    }

    if (!lookupBtn || !certListContainer) return;

    lookupBtn.addEventListener('click', () => {
      const queryEmail = emailInput?.value.trim().toLowerCase() || '';
      const queryName = nameInput?.value.trim().toLowerCase() || '';

      const allCerts = OneDropStore.get(OneDropStore.KEYS.CERTIFICATES) || [];
      const matches = allCerts.filter(c =>
        (queryEmail && c.email.toLowerCase().includes(queryEmail)) ||
        (queryName && c.name.toLowerCase().includes(queryName))
      );

      certListContainer.innerHTML = '';

      if (matches.length === 0) {
        certListContainer.innerHTML = `
          <div style="padding:20px;text-align:center;color:#6b7280;background:#f9fafb;border-radius:12px;">
            No certificates found. Try "aryan.s@email.com" or donate to earn your first certificate!
          </div>
        `;
        OneDropUI.showToast('No certificates found for this query.', 'info');
        return;
      }

      matches.forEach(cert => {
        const item = document.createElement('div');
        item.className = 'mycert-item';
        item.innerHTML = `
          <div class="mycert-item-left">
            <div class="mycert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>
              </svg>
            </div>
            <div>
              <div class="mycert-title">Donation on ${cert.date} (${cert.bloodGroup})</div>
              <div class="mycert-sub">${cert.id} &bull; ${cert.name}</div>
            </div>
          </div>
          <button class="mycert-view" style="border:none;cursor:pointer;background:transparent;color:#dc2626;font-weight:700;" data-cert-id="${cert.id}">
            View Certificate
          </button>
        `;
        certListContainer.appendChild(item);
      });

      certListContainer.querySelectorAll('.mycert-view').forEach(btn => {
        btn.addEventListener('click', () => {
          const cert = allCerts.find(c => c.id === btn.dataset.certId);
          if (cert) this.openCertModal(cert);
        });
      });

      OneDropUI.showToast(`Found ${matches.length} certificate(s)!`, 'success');
    });
  },

  _initGenerate() {
    const panel = document.getElementById('panel-generate');
    if (!panel) return;

    const nameInput = document.getElementById('gen-name');
    const emailInput = document.getElementById('gen-email');
    const bloodSelect = document.getElementById('gen-blood');
    const dateInput = document.getElementById('gen-date');
    const centerInput = document.getElementById('gen-center');
    const genBtn = panel.querySelector('button.btn');

    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    if (!genBtn) return;

    genBtn.addEventListener('click', () => {
      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim().toLowerCase();
      if (!name || !email) {
        OneDropUI.showToast('Please provide recipient name and email.', 'error'); return;
      }

      const dateRaw = dateInput?.value || '';
      const formattedDate = dateRaw
        ? new Date(dateRaw).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Recent';

      const certId = 'CERT-2026-' + Math.floor(100000 + Math.random() * 900000);
      const blood = bloodSelect?.value || 'O+';
      const center = centerInput?.value.trim() || 'City Hospital Blood Bank';

      const newCert = {
        id: certId,
        name, email, bloodGroup: blood,
        date: formattedDate,
        center,
        issuedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const allCerts = OneDropStore.get(OneDropStore.KEYS.CERTIFICATES) || [];
      allCerts.unshift(newCert);
      OneDropStore.set(OneDropStore.KEYS.CERTIFICATES, allCerts);

      // Update preview certificate in the panel
      const previewCert = panel.querySelector('.certificate');
      if (previewCert) {
        const certNameEl = previewCert.querySelector('.cert-name');
        if (certNameEl) certNameEl.textContent = newCert.name;

        const detailVals = previewCert.querySelectorAll('.cert-detail-value');
        if (detailVals.length >= 4) {
          detailVals[0].textContent = newCert.date;
          detailVals[1].textContent = newCert.bloodGroup;
          detailVals[2].textContent = newCert.center;
          detailVals[3].textContent = newCert.issuedOn;
        }
        const idEl = previewCert.querySelector('.cert-id');
        if (idEl) idEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2"/>
          </svg> ${newCert.id}`;
      }

      OneDropUI.showToast(`Certificate ${certId} generated!`, 'success');
      this.openCertModal(newCert);
    });
  },

  _initVerify() {
    const panel = document.getElementById('panel-verify');
    if (!panel) return;

    const idInput = document.getElementById('verify-id');
    const verifyBtn = panel.querySelector('button.btn');
    const resultBox = panel.querySelector('.verify-result');

    if (!verifyBtn || !resultBox) return;

    verifyBtn.addEventListener('click', () => {
      const queryId = idInput?.value.trim().toUpperCase() || '';
      if (!queryId) {
        OneDropUI.showToast('Please enter a credential ID (e.g. CERT-2026-847213).', 'error'); return;
      }

      const allCerts = OneDropStore.get(OneDropStore.KEYS.CERTIFICATES) || [];
      const cert = allCerts.find(c => c.id.toUpperCase() === queryId);

      if (cert) {
        resultBox.className = 'verify-result verified';
        resultBox.innerHTML = `
          <div class="verify-status-row ok" style="color:#10B981;font-weight:700;display:flex;align-items:center;gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
            Verified — This Certificate Is Authentic & Officially Registered
          </div>
          <div class="verify-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;">
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">DONOR NAME</div>
              <div class="verify-item-value" style="font-weight:700;color:#111827;">${cert.name}</div></div>
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">CREDENTIAL ID</div>
              <div class="verify-item-value" style="font-weight:700;color:#dc2626;">${cert.id}</div></div>
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">DONATION DATE</div>
              <div class="verify-item-value" style="font-weight:600;">${cert.date}</div></div>
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">BLOOD GROUP</div>
              <div class="verify-item-value" style="font-weight:700;color:#dc2626;">${cert.bloodGroup}</div></div>
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">DONATION CENTER</div>
              <div class="verify-item-value" style="font-weight:600;">${cert.center}</div></div>
            <div><div class="verify-item-label" style="font-size:.75rem;color:#6b7280;">ISSUED ON</div>
              <div class="verify-item-value" style="font-weight:600;">${cert.issuedOn}</div></div>
          </div>
        `;
        OneDropUI.showToast('Certificate verified authentic!', 'success');
      } else {
        resultBox.className = 'verify-result unverified';
        resultBox.innerHTML = `
          <div class="verify-status-row" style="color:#ef4444;font-weight:700;display:flex;align-items:center;gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
            </svg>
            Not Found — Invalid Credential ID
          </div>
          <p style="margin-top:10px;font-size:.9rem;color:#6b7280;">
            No record found for "<strong>${queryId}</strong>". Check for typos or verify it was issued by One Drop.
          </p>
        `;
        OneDropUI.showToast('Invalid certificate ID.', 'error');
      }
    });
  },

  openCertModal(cert) {
    OneDropUI.showModal("Official Hero's Certificate", `
      <div style="text-align:center;margin-bottom:20px;">
        <div class="certificate" style="border:2px solid #dc2626;border-radius:16px;padding:24px;background:#fffdfd;box-shadow:0 4px 20px rgba(220,38,38,.08);">
          <div style="color:#dc2626;font-size:.8rem;font-weight:700;letter-spacing:1px;margin-bottom:6px;">ONE DROP BLOOD BANK</div>
          <h2 style="font-size:1.4rem;color:#111827;margin-bottom:4px;">Certificate of Appreciation</h2>
          <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">This honors and certifies that</p>
          <div style="font-size:1.5rem;font-weight:800;color:#dc2626;margin-bottom:12px;">${cert.name}</div>
          <p style="font-size:.85rem;color:#4b5563;max-width:400px;margin:0 auto 18px;line-height:1.5;">
            generously gave the gift of blood (${cert.bloodGroup}), saving up to three human lives.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.8rem;border-top:1px solid #fecaca;padding-top:14px;text-align:left;">
            <div><strong>Date:</strong> ${cert.date}</div>
            <div><strong>Blood Group:</strong> ${cert.bloodGroup}</div>
            <div><strong>Center:</strong> ${cert.center}</div>
            <div><strong>Credential ID:</strong> ${cert.id}</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;gap:12px;">
        <button type="button" class="btn-continue" onclick="window.print()" style="padding:10px 24px;cursor:pointer;">🖨️ Print / Save PDF</button>
      </div>
    `);
  }
};
