/* ================================================================
   Mini Cargo — site interactions
   - Particle canvas background (mouse-reactive)
   - Intersection-observer scroll fade (AOS complement)
   - Latest-update details toggle
   - Back-to-top button
   - Typewriter hero title
   - Live game stats from Roblox API (cors-friendly endpoint set)
   - Dark/light theme toggle persisted in localStorage
   - Mobile nav hamburger
   - FAQ accordion (accessibility-correct)
   - Swiper galleries + Chart.js initialization
   - Collaborate form ( submits via GitHub Issues API )
=================================================================*/

(function () {
  'use strict';

  const UNIVERSE_ID = 10400840414;
  const PLACE_ID = 132204795118843;

  // ---------------- Theme toggle ----------------
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('mc-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('mc-theme', next);
    });
  }

  // ---------------- Mobile nav ----------------
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---------------- Particle canvas ----------------
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 12), 100);
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const base = Math.random() * 2 + 1;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: base, baseSize: base,
          speedX: (Math.random() - 0.5) * 0.45,
          speedY: (Math.random() - 0.5) * 0.45,
        });
      }
    }
    initParticles();

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function accentColor(alpha) {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      return dark ? `rgba(94, 168, 255, ${alpha})` : `rgba(74, 144, 226, ${alpha})`;
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accentColor(0.55);
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * 1.8;
            p.y += Math.sin(angle) * 1.8;
            p.size = Math.min(p.baseSize + 2, 6);
          } else { p.size = p.baseSize; }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ---------------- Scroll-into-view fade fallback ----------------
  function setupObserver() {
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

  // ---------------- Latest-update details toggle ----------------
  const detailsBtn = document.querySelector('.details-btn');
  const details = document.querySelector('.details');
  if (detailsBtn && details) {
    detailsBtn.addEventListener('click', () => {
      const hidden = details.classList.toggle('hidden');
      detailsBtn.textContent = hidden ? 'Show Details' : 'Hide Details';
      detailsBtn.setAttribute('aria-expanded', String(!hidden));
    });
  }

  // ---------------- Back to top ----------------
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('show', window.scrollY > 300);
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------------- Typewriter hero ----------------
  const typewriterEl = document.getElementById('typewriter');
  const typeTexts = ['Welcome to Mini Cargo!', 'Load it. Haul it. Win.', 'Climb the leaderboards!'];
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
    } else { tiChar = Math.max(0, tiChar - 1); typewriterEl.textContent = typeTexts[ti].slice(0, tiChar); }
    setTimeout(type, 75);
  }
  type();

  // ---------------- FAQ accordion ----------------
  document.querySelectorAll('.faq-q').forEach(btn => {
    const answer = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        answer.style.maxHeight = '0';
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ---------------- Swiper (galleries) ----------------
  function initSwipers() {
    if (!window.Swiper) return;
    if (document.querySelector('.mySwiper')) {
      new Swiper('.mySwiper', {
        loop: true, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        autoplay: { delay: 4500, disableOnInteraction: false },
      });
    }
    if (document.querySelector('.testimonialSwiper')) {
      new Swiper('.testimonialSwiper', {
        loop: true, pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 5500, disableOnInteraction: false },
      });
    }
  }
  if (window.Swiper) initSwipers();
  else { const t = setInterval(() => { if (window.Swiper) { clearInterval(t); initSwipers(); } }, 100); }

  // ---------------- AOS init ----------------
  function initAOS() { if (window.AOS) AOS.init({ once: true, offset: 100 }); else setTimeout(initAOS, 100); }
  initAOS();

  // ---------------- Live stats via Roblox API ----------------
  const BADGE = document.getElementById('live-badge');
  const LIVE_COUNT = document.getElementById('live-count');
  const STAT_PLAYERS = document.getElementById('stat-players');
  const STAT_VISITS = document.getElementById('stat-visits');
  const STAT_FAV = document.getElementById('stat-fav');

  // CORS-friendly proxies that prepend the right headers; fall back chain.
  const PROXIES = [
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => u, // direct (may fail on CORS but worth trying on the page domain)
  ];

  async function fetchJSON(url) {
    let lastErr;
    for (const wrap of PROXIES) {
      try {
        const res = await fetch(wrap(url), { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('fetch failed');
  }

  function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }

  async function refreshStats() {
    if (STAT_PLAYERS) STAT_PLAYERS.textContent = '…';
    try {
      const data = await fetchJSON(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`);
      const g = (data && data.data && data.data[0]) || null;
      if (!g || g.name.includes('UNAVAILABLE')) {
        // Game is content-restricted, populate with gracefully-handled placeholder.
        if (STAT_PLAYERS) STAT_PLAYERS.textContent = '—';
        if (STAT_VISITS) STAT_VISITS.textContent = '—';
        if (STAT_FAV) STAT_FAV.textContent = '—';
        if (LIVE_COUNT) LIVE_COUNT.textContent = 'unavailable';
        if (BADGE) BADGE.hidden = false;
        return;
      }
      if (STAT_PLAYERS) STAT_PLAYERS.textContent = fmt(g.playing);
      if (STAT_VISITS) STAT_VISITS.textContent = fmt(g.visits);
      if (STAT_FAV) STAT_FAV.textContent = fmt(g.favoritedCount);
      if (LIVE_COUNT) LIVE_COUNT.textContent = fmt(g.playing);
      if (BADGE) BADGE.hidden = false;
    } catch (e) {
      if (STAT_PLAYERS) STAT_PLAYERS.textContent = '—';
      if (LIVE_COUNT) LIVE_COUNT.textContent = 'unavailable';
      if (BADGE) BADGE.hidden = false;
    }
  }

  const refreshBtn = document.getElementById('refresh-stats');
  if (refreshBtn) refreshBtn.addEventListener('click', refreshStats);
  refreshStats();

  // ---------------- Chart.js stats chart ----------------
  function withAlpha(color, alpha) {
    return color.startsWith('rgba') ? color.replace(/,\s*[\d.]+\)/, `, ${alpha})`) : color;
  }

  function initStatsChart() {
    if (!window.Chart) return;
    const cv = document.getElementById('statsChart');
    if (!cv) return;
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent').trim() || '#4a90e2';
    const text = cs.getPropertyValue('--text-muted').trim() || '#56657a';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const playerData = [0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.1, 3.5, 3.9, 4.2, 4.6, 5.0];

    new Chart(cv, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly active players (thousands)',
          data: playerData,
          borderColor: accent,
          backgroundColor: withAlpha(accent, 0.18),
          tension: 0.4,
          fill: true,
          pointBackgroundColor: accent,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: text } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { ticks: { color: text }, grid: { color: 'rgba(128,128,128,0.15)' } },
          y: { ticks: { color: text }, grid: { color: 'rgba(128,128,128,0.15)' } }
        }
      }
    });
  }
  if (window.Chart) initStatsChart();
  else { const t = setInterval(() => { if (window.Chart) { clearInterval(t); initStatsChart(); } }, 100); }

  // ---------------- Collaborate form (URL redirect → GitHub Issue) ----------------
  // SECURE static-site pattern: the visitor's own GitHub session files the issue,
  // so no bot token is exposed client-side. We build an issue template URL with
  // query params that GitHub pre-fills into the "new issue" page. The visitor
  // just hits "Submit new issue" and it lands in l-amb/mini-cargo-site as a
  // real collab request. For visitors without a GitHub account we fall back to
  // Discord.
  const collabForm = document.getElementById('collab-form');
  if (collabForm) {
    const ISSUE_REPO = 'l-amb/mini-cargo-site';

    function buildTitle(name, type) {
      return `[Collab request] ${type} from ${name || 'Anonymous'}`;
    }
    function buildBody(name, contact, type, message) {
      return [
        '### Collaboration request for the Mini Cargo game',
        '',
        `- **Name / Handle:** ${name || '_(not provided)_'}`,
        `- **Contact:** ${contact || '_(not provided)_'}`,
        `- **Request type:** ${type}`,
        '',
        '### Proposal',
        '',
        message || '_(no message provided)_',
        '',
        '---',
        '_Submitted via the Mini Cargo website Collaborate form._',
      ].join('\n');
    }

    collabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('collab-status');
      const submitBtn = collabForm.querySelector('button[type="submit"]');
      const name = (document.getElementById('collab-name').value || '').trim();
      const contact = (document.getElementById('collab-contact').value || '').trim();
      const type = document.getElementById('collab-type').value;
      const message = (document.getElementById('collab-message').value || '').trim();

      const title = buildTitle(name, type);
      const body = buildBody(name, contact, type, message);

      // GitHub supports ?title= and ?body= on the /issues/new URL.
      const url = `https://github.com/${ISSUE_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

      status.className = 'form-status ok';
      status.innerHTML = `Opening GitHub so you can publish your request as an issue&hellip; ` +
        `(If nothing opens, <a href="${url}" target="_blank" rel="noopener">click here</a>.) ` +
        `No GitHub account? Drop the same message in our <a href="#discord">Discord</a> instead.`;
      status.style.display = 'block';
      submitBtn.disabled = true;

      // Open the prefilled GitHub issue page in a new tab.
      window.open(url, '_blank', 'noopener');

      // Reset the submit button after a moment so the user can re-submit if needed.
      setTimeout(() => { submitBtn.disabled = false; }, 2500);
    });
  }
})();
