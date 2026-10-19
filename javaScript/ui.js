/**
 * ONE DROP BLOOD BANK - Global UI Utilities
 * Toast notifications & Modal system. Depends on: store.js
 */

const OneDropUI = {
  toastContainer: null,

  showToast(message, type = 'info', duration = 3800) {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'od-toast-container';
      document.body.appendChild(this.toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `od-toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  showModal(title, contentHtml) {
    const existing = document.getElementById('od-global-modal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'od-global-modal';
    backdrop.className = 'od-modal-backdrop active';
    backdrop.innerHTML = `
      <div class="od-modal" role="dialog" aria-modal="true">
        <div class="od-modal-header">
          <h3 class="od-modal-title">${title}</h3>
          <button class="od-modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="od-modal-body">
          ${contentHtml}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeModal = () => {
      backdrop.classList.remove('active');
      setTimeout(() => backdrop.remove(), 250);
    };

    backdrop.querySelector('.od-modal-close').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    return { close: closeModal, modalElement: backdrop.querySelector('.od-modal') };
  },

  generateCaptcha(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return '';
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    el.textContent = code;
    el.dataset.code = code;
    return code;
  }
};
