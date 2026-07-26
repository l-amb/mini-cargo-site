// script.js – placeholder for dynamic stats with both player count and session length
// Attempts to fetch live player count from Roblox API (requires proper token)
document.addEventListener('DOMContentLoaded', () => {
  const fetchStats = async () => {
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;
    try {
      const response = await fetch('https://games.roblox.com/v1/games?placeIds=132204795118843');
      const data = await response.json();
      if (data && data[0] && data[0].playing) {
        document.getElementById('player-count').textContent = data[0].playing;
      }
      // Placeholder for session length – Roblox API does not provide this directly.
      document.getElementById('session-length').textContent = 'N/A';
    } catch (e) {
      console.warn('Failed to fetch live stats:', e);
    }
  };
  // Initial fetch
  fetchStats();
  // Refresh button
  const refreshBtn = document.getElementById('refresh-stats');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchStats);
  }
});
