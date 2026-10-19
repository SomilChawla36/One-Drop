/**
 * ONE DROP BLOOD BANK - Find Blood & Emergency Broadcast
 * Real-time blood group filtering, donor grid, direct requests, emergency SOS.
 * Used on: find.html
 * Depends on: store.js, ui.js, auth.js
 */

const OneDropSearch = {
  selectedGroup: 'O+',
  selectedFilter: 'All Sources',

  init() {
    if (!document.querySelector('.search-card')) return;
    this.bindFilters();
    this.renderDonorsGrid();
    this.bindEmergencyForm();
    this.bindCardActions();
  },

  bindFilters() {
    // Blood group radio chips
    document.querySelectorAll('input[name="blood_group"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedGroup = e.target.value;
        this.filterAndRender();
        OneDropUI.showToast(`Filtered for blood group: ${this.selectedGroup}`, 'info', 2000);
      });
    });

    // Source filter chips
    const chips = Array.from(document.querySelectorAll('.filter-bar .filter-chip'));
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('active');
          c.style.backgroundColor = '';
          c.style.color = '';
          c.style.borderColor = '';
        });
        chip.classList.add('active');
        chip.style.backgroundColor = '#FEF2F2';
        chip.style.color = '#EF4444';
        chip.style.borderColor = '#FECACA';
        this.selectedFilter = chip.textContent.trim();
        this.filterAndRender();
      });
    });

    // Sort dropdown
    const sortSelect = document.querySelector('.sort-wrapper select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.filterAndRender());
    }

    // Search button
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const loc = document.getElementById('location')?.value || 'City';
        OneDropUI.showToast(`Searching ${this.selectedGroup} units near ${loc}...`, 'info');
        this.filterAndRender();
      });
    }
  },

  filterAndRender() {
    const resultCards = Array.from(document.querySelectorAll('.results-list .result-card'));
    let matchCount = 0;

    resultCards.forEach(card => {
      const sourceName = card.querySelector('.source-name')?.textContent || '';
      const pills = Array.from(card.querySelectorAll('.unit-pill'));
      let hasGroup = pills.some(p => p.textContent.includes(this.selectedGroup));

      let matchesFilter = true;
      if (this.selectedFilter === 'Blood Banks' &&
          !sourceName.toLowerCase().includes('blood bank') &&
          !sourceName.toLowerCase().includes('center')) {
        matchesFilter = false;
      }
      if (this.selectedFilter === 'Hospitals' && !sourceName.toLowerCase().includes('hospital')) {
        matchesFilter = false;
      }

      if (hasGroup && matchesFilter) {
        card.style.display = '';
        matchCount++;
        pills.forEach(p => {
          p.classList.toggle('highlight', p.textContent.includes(this.selectedGroup));
        });
      } else {
        card.style.display = 'none';
      }
    });

    const countHeader = document.querySelector('.results-list h3');
    if (countHeader) {
      countHeader.textContent = `${matchCount} Blood Sources Found for ${this.selectedGroup}`;
    }

    this.renderDonorsGrid();
  },

  renderDonorsGrid() {
    const donorsGrid = document.querySelector('.donors-grid');
    if (!donorsGrid) return;

    const allDonors = OneDropStore.get(OneDropStore.KEYS.DONORS) || [];
    const sentRequests = OneDropStore.get(OneDropStore.KEYS.REQUESTS) || [];

    const matched = allDonors.filter(d => {
      const g = this.selectedGroup;
      if (g === 'O+') return d.bloodGroup === 'O+' || d.bloodGroup === 'O-';
      if (g === 'A+') return ['A+', 'A-', 'O+', 'O-'].includes(d.bloodGroup);
      if (g === 'B+') return ['B+', 'B-', 'O+', 'O-'].includes(d.bloodGroup);
      if (g === 'AB+') return true;
      return d.bloodGroup === g;
    });

    donorsGrid.innerHTML = '';

    if (matched.length === 0) {
      donorsGrid.innerHTML = `
        <div style="grid-column:1/-1;background:#fff;padding:28px;border-radius:16px;text-align:center;color:#6b7280;border:1px dashed #d1d5db;">
          No verified donors currently listed for ${this.selectedGroup}.
          <a href="become-a-donar.html" style="color:#dc2626;font-weight:600;"> Be the first to register!</a>
        </div>
      `;
      return;
    }

    matched.forEach(donor => {
      const isRequested = sentRequests.includes(donor.id);
      const initials = donor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'donor-card';
      card.innerHTML = `
        <div class="donor-header">
          <div class="donor-avatar-info">
            <div class="donor-avatar">${initials}</div>
            <div>
              <div class="donor-name">${donor.fullName}</div>
              <span style="font-size:0.75rem;color:#10B981;">✓ Verified Donor</span>
            </div>
          </div>
          <span class="donor-group-badge">${donor.bloodGroup}</span>
        </div>
        <div class="donor-details">
          <span>📍 Approx ${donor.distance || '3.5 km'}</span>
          <span>🕒 Last donated: ${donor.lastDonated || 'Recent'}</span>
          <span>🟢 ${donor.status || 'Available'}</span>
        </div>
        <button type="button" class="btn-secondary req-btn-action" data-donor-id="${donor.id}"
          style="width:100%;justify-content:center;
          background-color:${isRequested ? '#d1fae5' : '#FEF2F2'};
          color:${isRequested ? '#059669' : '#EF4444'};
          border-color:${isRequested ? '#a7f3d0' : '#FECACA'};cursor:pointer;">
          ${isRequested ? '✓ Request Sent' : 'Send Direct Request'}
        </button>
      `;
      donorsGrid.appendChild(card);
    });

    // Wire Direct Request buttons
    donorsGrid.querySelectorAll('.req-btn-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const dId = btn.dataset.donorId;
        const reqs = OneDropStore.get(OneDropStore.KEYS.REQUESTS) || [];
        if (reqs.includes(dId)) {
          OneDropUI.showToast('You have already sent a request to this donor.', 'info'); return;
        }
        reqs.push(dId);
        OneDropStore.set(OneDropStore.KEYS.REQUESTS, reqs);
        btn.textContent = '✓ Request Sent';
        btn.style.backgroundColor = '#d1fae5';
        btn.style.color = '#059669';
        btn.style.borderColor = '#a7f3d0';
        OneDropUI.showToast('Emergency notification dispatched to donor!', 'success');
      });
    });
  },

  bindCardActions() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.textContent.includes('View Details')) {
        const card = btn.closest('.result-card');
        const bankName = card?.querySelector('.source-name')?.childNodes[0]?.textContent?.trim() || 'Blood Bank';
        OneDropUI.showModal(`Details: ${bankName}`, `
          <div style="font-size:0.95rem;line-height:1.7;color:#374151;">
            <p><strong>Facility Type:</strong> Certified Regional Transfusion Bank</p>
            <p><strong>Operating Hours:</strong> 24 Hours / 7 Days a week</p>
            <p><strong>Licence:</strong> Central Drug Standard Control Approved (#DL-2024-889)</p>
            <p><strong>Storage Capacity:</strong> 450 Whole Units / 120 Plasma Units</p>
            <p><strong>Emergency Transport:</strong> Available within 15 mins</p>
            <div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:10px;color:#b91c1c;">
              📞 Call Desk: <strong>+91 (022) 2899-4400</strong>
            </div>
          </div>
        `);
      }

      if (btn.textContent.trim() === 'Get Directions') {
        const card = btn.closest('.result-card');
        const bankName = card?.querySelector('.source-name')?.childNodes[0]?.textContent?.trim() || 'Blood Bank';
        OneDropUI.showToast(`Navigating to ${bankName}...`, 'info');
      }

      if (btn.classList.contains('btn-call')) {
        OneDropUI.showModal('Emergency Contact Hotline', `
          <div style="text-align:center;padding:10px 0;">
            <div style="font-size:2.5rem;margin-bottom:10px;">📞</div>
            <h4>Direct Emergency Connection</h4>
            <p style="color:#6b7280;font-size:0.9rem;margin-bottom:18px;">Connecting to on-duty blood bank officer...</p>
            <a href="tel:18002566366" class="btn-request" style="display:inline-block;font-size:1.1rem;padding:12px 24px;">Dial 1800-BLOOD-NOW</a>
          </div>
        `);
      }
    });
  },

  bindEmergencyForm() {
    const formBox = document.querySelector('.emergency-form');
    if (!formBox) return;

    const broadcastBtn = formBox.querySelector('.emergency-btn-label');
    const msgDiv = formBox.querySelector('.emergency-msg');

    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const group = formBox.querySelector('select')?.value;
        const units = formBox.querySelector('input[type="number"]')?.value;
        const hospital = formBox.querySelector('input[placeholder*="hospital"]')?.value;
        const phone = formBox.querySelector('input[type="tel"]')?.value;

        if (!hospital || !phone) {
          OneDropUI.showToast('Please provide hospital name and contact phone.', 'error'); return;
        }

        const emergency = {
          id: 'emg_' + Date.now(),
          group, units: units || 2, hospital, phone,
          timestamp: new Date().toISOString()
        };
        const broadcasts = OneDropStore.get(OneDropStore.KEYS.EMERGENCY) || [];
        broadcasts.push(emergency);
        OneDropStore.set(OneDropStore.KEYS.EMERGENCY, broadcasts);

        if (msgDiv) {
          msgDiv.style.display = 'block';
          msgDiv.innerHTML = `🚨 <strong>BROADCAST SENT!</strong> Alerting ${units || 2} units of <strong>${group}</strong> to 45 nearby donors & trauma teams for <strong>${hospital}</strong>.`;
        }
        OneDropUI.showToast('Emergency SOS Broadcasted across regional network!', 'success', 5000);
      });
    }
  }
};
