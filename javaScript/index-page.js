/**
 * ONE DROP BLOOD BANK - Index / Home Page Controller
 * Dynamic metrics counter from localStorage data.
 * Used on: index.html
 * Depends on: store.js
 */

const OneDropIndex = {
  init() {
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards || statCards.length === 0) return;

    const donors = OneDropStore.get(OneDropStore.KEYS.DONORS) || [];
    const requests = OneDropStore.get(OneDropStore.KEYS.REQUESTS) || [];
    const broadcasts = OneDropStore.get(OneDropStore.KEYS.EMERGENCY) || [];

    const totalDonors = 24800 + donors.length;
    const totalLives = 74200 + (donors.length * 3);
    const totalReqs = 18500 + requests.length + broadcasts.length;

    const updateCard = (cardIndex, value) => {
      const el = statCards[cardIndex]?.querySelector('.stat-num');
      if (el) el.textContent = value.toLocaleString() + '+';
    };

    updateCard(0, totalDonors);
    updateCard(1, totalLives);
    updateCard(2, totalReqs);
  }
};
