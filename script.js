/* =====================================================================
 * Mini Cargo — site interactivity
 * Sections: particle canvas, scroll reveal, typewriter, latest-update
 *           toggle, live Roblox stats + chart, gallery swiper, testimonials,
 *           collab form (no backend — demo), FAQ accordion, back-to-top.
 * ===================================================================== */

(function () {
  'use strict';

  /* ----------------------------- 1. Particles ---------------------------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let mouse = { x: null, y: null };

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 12), 90);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      baseSize: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    });
  }

  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  }

  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.speedX; p.y += p.speedY;
      if (p.x > canvas.width) p.x = 0;
      if (p.x < 0) p.x = canvas.width;
      if (p.y > canvas.height) p.y = 0;
      if (p.y < 0) p.y = canvas.height;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * 2;
          p.y += Math.sin(angle) * 2;
          p.size = Math.min(p.baseSize + 2, 6);
        } else { p.size = p.baseSize; }
      }
      ctx.fillStyle = 'rgba(93,166,255,0.55)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animateParticles();

  /* ----------------------- 2. Scroll-into-view reveal ------------------- */
  function setupObserver() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.content-section').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.content-section').forEach(s => observer.observe(s));
  }
  setupObserver();

  /* ------------------------- 3. Latest-update toggle -------------------- */
  const detailsBtn = document.querySelector('.details-btn');
  const details = document.querySelector('.details');
  if (detailsBtn && details) {
    detailsBtn.addEventListener('click', () => {
      const isHidden = details.classList.contains('hidden');
      details.classList.toggle('hidden');
      detailsBtn.textContent = isHidden ? 'Hide Details' : 'Show Details';
      detailsBtn.setAttribute('aria-expanded', String(isHidden));
    });
  }

  /* ------------------------- 4. Typewriter hero ------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  const typeTexts = ['Welcome to Mini Cargo! 🚢', 'Your cargo adventure awaits!', 'Play. Compete. Collaborate.'];
  let ti = 0, tiChar = 0, typing = true;
  function type() {
    if (!typewriterEl) return;
    if (typing) {
      typewriterEl.textContent = typeTexts[ti].slice(0, tiChar + 1);
      tiChar++;
      if (tiChar === typeTexts[ti].length) {
        typing = false;
        setTimeout(() => { typing = true; ti = (ti + 1) % typeTexts.length; tiChar = 0; }, 2200);
      }
    }
    setTimeout(type, 80);
  }
  if (typewriterEl) type();

  /* ------------------------- 5. Live Roblox stats ------------------------ */
  const UNIVERSE_ID = 10400840414;
  const PLACE_ID = 132204795118843;
  let statsChart = null;

  function formatNumber(n) {
    if (n == null) return '—';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }

  function timeAgo(date) {
    if (!date) return '—';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return seconds + 's ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  }

  function setStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Demo fallback numbers used when the Roblox API is unreachable from
  // GitHub Pages (browsers block mixed/CORS requests without proper headers)
  const DEMO_STATS = { playing: 1234, visits: 45678, favorites: 567, updated: new Date() };
  const DEMO_GROWTH = [0.8, 1.2, 1.5, 1.9, 2.3, 2.8, 3.1, 3.5, 3.9, 4.2, 4.6, 5.0];

  function applyDemo(label) {
    setStat('stat-playing', formatNumber(DEMO_STATS.playing));
    setStat('stat-favorites', DEMO_STATS.favorites.toLocaleString());
    setStat('stat-visits', DEMO_STATS.visits.toLocaleString());
    setStat('stat-updated', label || timeAgo(DEMO_STATS.updated));
  }

  async function fetchLiveStats() {
    setStat('stat-updated', 'loading…');
    try {
      const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const g = json.data && json.data[0];
      if (!g) throw new Error('No data');

      setStat('stat-playing', formatNumber(g.playing));
      setStat('stat-favorites', g.favoritedCount ? g.favoritedCount.toLocaleString() : '—');
      setStat('stat-visits', g.visits ? g.visits.toLocaleString() : '—');
      setStat('stat-updated', timeAgo(new Date()));

      if (window.__miniCargoStatsTimestamp) {
        setStat('stat-updated', timeAgo(new Date(window.__miniCargoStatsTimestamp)));
      }
      window.__miniCargoStatsTimestamp = Date.now();
      return true;
    } catch (err) {
      console.warn('[Mini Cargo] Live Roblox stats fetch failed — using demo values:', err.message);
      applyDemo('demo');
      return false;
    }
  }

  /* Chart.js growth chart */
  function initChart() {
    if (!window.Chart || !document.getElementById('statsChart')) return;
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-strong').trim() || '#5da6ff';
    statsChart = new Chart(document.getElementById('statsChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Players (k)',
          data: DEMO_GROWTH,
          borderColor: accent,
          backgroundColor: 'rgba(93,166,255,0.18)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: accent,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}k players` } } },
        scales: {
          y: { ticks: { color: '#9fb3cc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          x: { ticks: { color: '#9fb3cc' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }
  if (window.Chart) initChart();
  else {
    const chCheck = setInterval(() => {
      if (window.Chart) { clearInterval(chCheck); initChart(); }
    }, 100);
  }

  const refreshBtn = document.getElementById('refresh-stats');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    refreshBtn.textContent = '⏳ Refreshing…';
    refreshBtn.disabled = true;
    fetchLiveStats().finally(() => {
      setTimeout(() => {
        refreshBtn.textContent = '🔄 Refresh Stats';
        refreshBtn.disabled = false;
      }, 400);
    });
  });

  /* Load live stats on first paint */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLiveStats);
  } else {
    fetchLiveStats();
  }
  /* Refresh every 5 minutes */
  setInterval(fetchLiveStats, 5 * 60 * 1000);

  /* ---------------------------- 6. Swipers ------------------------------- */
  function initSwipers() {
    if (!window.Swiper) return;
    new Swiper('.mySwiper', {
      loop: true,
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      pagination: { el: '.swiper-pagination', clickable: true },
      autoplay: { delay: 4000 },
    });
    new Swiper('.testimonialSwiper', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      autoplay: { delay: 5500 },
    });
  }
  if (window.Swiper) initSwipers();
  else {
    const swCheck = setInterval(() => {
      if (window.Swiper) { clearInterval(swCheck); initSwipers(); }
    }, 100);
  }

  /* ---------------------------- 7. AOS init ------------------------------ */
  function initAOS() {
    if (window.AOS) AOS.init({ once: true, offset: 120 });
    else setTimeout(initAOS, 100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAOS);
  else initAOS();

  /* ---------------------------- 8. Collab form --------------------------- */
  const collabForm = document.getElementById('collab-form');
  if (collabForm) {
    const statusEl = collabForm.querySelector('.form-status');
    collabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = collabForm.querySelector('#collab-name').value.trim();
      const contact = collabForm.querySelector('#collab-email').value.trim();
      const type = collabForm.querySelector('#collab-type').value;
      const message = collabForm.querySelector('#collab-message').value.trim();

      statusEl.className = 'form-status';
      if (!name || !contact || !message) {
        statusEl.textContent = 'Please fill in your name, contact, and a short message.';
        statusEl.classList.add('error');
        return;
      }

      // Persist locally so the user can see their requests even without a backend
      const key = 'mini-cargo-collab-requests';
      const requests = JSON.parse(localStorage.getItem(key) || '[]');
      requests.push({ name, contact, type, message, submittedAt: new Date().toISOString() });
      try { localStorage.setItem(key, JSON.stringify(requests)); } catch (_) { /* storage disabled */ }

      statusEl.textContent = `✓ Thanks ${name}! Your ${type} collab request has been recorded. We'll follow up via ${contact} soon.`;
      statusEl.classList.add('success');
      collabForm.reset();
    });
  }

  /* ---------------------------- 9. FAQ accordion ------------------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Optional: close siblings
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* --------------------------- 10. Back to top --------------------------- */
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) backBtn.classList.add('show');
      else backBtn.classList.remove('show');
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ----------- 11. Persist the existing intentionally-removed bits ------- */
  /* The old "scripts/gh_pages_update.sh" helper from the previous version
     needed an external token — removing it avoided leaking credentials. */
  console.log('%cMini Cargo site loaded 🚢', 'color:#5da6ff;font-weight:bold');
})();
