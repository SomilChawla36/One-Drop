/**
 * ONE DROP BLOOD BANK - Community Drives & Stories
 * Blood drive slot booking and community story wall.
 * Used on: community.html
 * Depends on: store.js, ui.js, auth.js
 */

const OneDropCommunity = {
  init() {
    if (!document.getElementById('drives')) return;
    this._initDriveBookings();
    this._initStoryWall();
  },

  _initDriveBookings() {
    const driveRows = Array.from(document.querySelectorAll('.drive-list .drive-row'));
    const bookings = OneDropStore.get(OneDropStore.KEYS.DRIVE_BOOKINGS) || {};

    driveRows.forEach((row, idx) => {
      const driveKey = `drive_${idx}`;
      const title = row.querySelector('h3')?.textContent || `Camp ${idx + 1}`;
      const slotsEl = row.querySelector('.drive-slots');

      if (bookings[driveKey]) {
        if (slotsEl) {
          slotsEl.textContent = 'Booked ✓';
          slotsEl.style.color = '#10b981';
          slotsEl.style.fontWeight = '700';
        }
      }

      row.style.cursor = 'pointer';
      row.title = 'Click to RSVP / Book a slot';

      row.addEventListener('click', () => {
        const curBookings = OneDropStore.get(OneDropStore.KEYS.DRIVE_BOOKINGS) || {};
        if (curBookings[driveKey]) {
          OneDropUI.showToast(`You have already registered for: ${title}`, 'info'); return;
        }

        const user = OneDropAuth.getCurrentUser();

        OneDropUI.showModal(`Register for ${title}`, `
          <div style="font-size:.95rem;color:#374151;line-height:1.7;">
            <p>Join fellow donors at <strong>${title}</strong>.</p>
            <div style="margin:16px 0;">
              <label style="display:block;font-size:.8rem;font-weight:600;margin-bottom:4px;">Your Name</label>
              <input type="text" id="drive-rsvp-name" value="${user ? user.firstName + ' ' + user.lastName : ''}"
                placeholder="Full Name" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
            </div>
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:.8rem;font-weight:600;margin-bottom:4px;">Phone Number</label>
              <input type="tel" id="drive-rsvp-phone" value="${user?.phone || ''}"
                placeholder="Phone" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
            </div>
            <button type="button" class="btn-continue" id="drive-confirm-btn" style="width:100%;justify-content:center;">
              Confirm Slot RSVP
            </button>
          </div>
        `);

        document.getElementById('drive-confirm-btn')?.addEventListener('click', () => {
          const rName = document.getElementById('drive-rsvp-name')?.value.trim();
          if (!rName) { OneDropUI.showToast('Please enter your name.', 'error'); return; }

          curBookings[driveKey] = { name: rName, time: new Date().toISOString() };
          OneDropStore.set(OneDropStore.KEYS.DRIVE_BOOKINGS, curBookings);

          if (slotsEl) {
            slotsEl.textContent = 'Booked ✓';
            slotsEl.style.color = '#10b981';
            slotsEl.style.fontWeight = '700';
          }

          document.getElementById('od-global-modal')?.remove();
          OneDropUI.showToast(`Slot booked for ${title}! We look forward to seeing you.`, 'success');
        });
      });
    });
  },

  _initStoryWall() {
    const wallSection = document.querySelector('.donor-grid');
    if (!wallSection) return;

    // Load previously submitted stories first
    const userStories = OneDropStore.get(OneDropStore.KEYS.COMMUNITY_STORIES) || [];
    userStories.forEach(s => wallSection.prepend(this._buildStoryCard(s)));

    // Add "Share Your Story" button
    const wallHead = document.querySelector('.section-alt .section-head');
    if (wallHead) {
      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'btn btn-ghost';
      shareBtn.style.cssText = 'margin-top:16px;display:inline-flex;cursor:pointer;';
      shareBtn.innerHTML = '✍️ Share Your Donor Story';

      shareBtn.addEventListener('click', () => this._openStoryModal(wallSection));
      wallHead.appendChild(shareBtn);
    }
  },

  _openStoryModal(wallSection) {
    const user = OneDropAuth.getCurrentUser();
    OneDropUI.showModal('Share Your Story', `
      <div style="font-size:.95rem;color:#374151;">
        <div style="margin-bottom:12px;">
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Your Name</label>
          <input type="text" id="story-name" value="${user ? user.firstName + ' ' + user.lastName : ''}"
            placeholder="e.g. Aryan K." style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">City</label>
          <input type="text" id="story-city" placeholder="e.g. Mumbai"
            style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Badge / Experience</label>
          <select id="story-badge" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;">
            <option>First-Time Hero</option>
            <option>Regular Donor</option>
            <option>5-Time Donor</option>
            <option>Drive Organizer</option>
          </select>
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Your Quote / Story</label>
          <textarea id="story-quote" rows="3" placeholder="Tell us what motivates you to donate blood..."
            style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-family:inherit;"></textarea>
        </div>
        <button type="button" class="btn-continue" id="submit-story-btn" style="width:100%;justify-content:center;">
          Post to Community Wall
        </button>
      </div>
    `);

    document.getElementById('submit-story-btn')?.addEventListener('click', () => {
      const name = document.getElementById('story-name')?.value.trim();
      const city = document.getElementById('story-city')?.value.trim() || 'Community Member';
      const badge = document.getElementById('story-badge')?.value;
      const quote = document.getElementById('story-quote')?.value.trim();

      if (!name || !quote) {
        OneDropUI.showToast('Please provide your name and quote.', 'error'); return;
      }

      const story = { name, city, badge, quote, initials: name.slice(0, 2).toUpperCase() };
      const stories = OneDropStore.get(OneDropStore.KEYS.COMMUNITY_STORIES) || [];
      stories.unshift(story);
      OneDropStore.set(OneDropStore.KEYS.COMMUNITY_STORIES, stories);

      wallSection.prepend(this._buildStoryCard(story));
      document.getElementById('od-global-modal')?.remove();
      OneDropUI.showToast('Your story has been added to the community wall!', 'success');
    });
  },

  _buildStoryCard(s) {
    const card = document.createElement('div');
    card.className = 'donor-card';
    card.innerHTML = `
      <div class="donor-top">
        <div class="donor-avatar">${s.initials}</div>
        <div>
          <div class="donor-name">${s.name}</div>
          <div class="donor-city">${s.city}</div>
        </div>
      </div>
      <p class="donor-quote">"${s.quote}"</p>
      <span class="donor-badge">${s.badge}</span>
    `;
    return card;
  }
};
