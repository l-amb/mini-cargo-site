/* ================================================================
   Mini Cargo — site interactions v0.4
   - Loading screen on first visit (game-style)
   - Particle canvas background (mouse-reactive)
   - Scroll progress bar
   - Intersection-observer scroll fade (AOS complement)
   - Latest-update details toggle
   - Back-to-top button
   - Typewriter hero title
   - Live game stats from Roblox API (with demo mode fallback)
   - Chart.js stats chart (live + demo data)
   - Dark/light theme toggle persisted in localStorage
   - Mobile nav hamburger
   - FAQ accordion (accessibility-correct) + search filter
   - Swiper galleries
   - Interactive ROADMAP with localStorage voting
   - Cargo-sorting MINI-GAME in hero
   - Notification toast system (rotating tips)
   - Floating cargo box animations
   - Konami code easter egg → confetti
   - Feature cards flip/expand
   - Trailer "notify me" promise
   - Collaborate form → redirect to GitHub Issues for GAME collab
=================================================================*/

(function () {
  'use strict';

  const UNIVERSE_ID = 10400840414;
  const PLACE_ID = 132204795118843;

  // ================================================================
  // Loading screen (game-style boot, shown only on first visit)
  // ================================================================
  (function loadingScreen() {
    if (sessionStorage.getItem('mc-loaded-once')) return;
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-inner">
        <div class="loading-truck">&#128666;</div>
        <div class="loading-text">LOADING MINI CARGO&hellip;</div>
        <div class="loading-bar"><div class="loading-fill"></div></div>
      </div>`;
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:#0f1622;
      display:flex;align-items:center;justify-content:center;
      transition:opacity .4s ease;`;
    document.body.appendChild(overlay);

    const fill = document.querySelector('.loading-fill');
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 5;
      if (prog > 100) prog = 100;
      if (fill) fill.style.width = prog + '%';
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            sessionStorage.setItem('mc-loaded-once', '1');
          }, 400);
        }, 200);
      }
    }, 90);
  })();

  // Inject loading-screen styles once
  (function injectLoadingCSS() {
    const css = document.createElement('style');
    css.textContent = `
      .loading-inner{text-align:center;color:#5ea8ff;font-family:Poppins,sans-serif;}
      .loading-truck{font-size:4rem;animation:truckBounce .8s ease-in-out infinite;}
      @keyframes truckBounce{0%,100%{transform:translateX(-15px) rotate(-5deg)}50%{transform:translateX(15px) rotate(5deg)}}
      .loading-text{margin:1rem 0 .5rem;font-weight:800;letter-spacing:1px;}
      .loading-bar{width:240px;height:8px;background:#1f2c3d;border-radius:4px;overflow:hidden;margin:0 auto;}
      .loading-fill{height:100%;width:0;background:linear-gradient(90deg,#4a90e2,#6ad1c8);border-radius:4px;transition:width .09s ease;}
    `;
    document.head.appendChild(css);
  })();

  // ================================================================
  // Theme toggle
  // ================================================================
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

  // ================================================================
  // Mobile nav
  // ================================================================
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

  // ================================================================
  // Scroll progress bar
  // ================================================================
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  // ================================================================
  // Particle canvas
  // ================================================================
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

  // ================================================================
  // Scroll-into-view fade fallback
  // ================================================================
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

  // ================================================================
  // Latest-update details toggle
  // ================================================================
  const detailsBtn = document.querySelector('.details-btn');
  const details = document.querySelector('.details');
  if (detailsBtn && details) {
    detailsBtn.addEventListener('click', () => {
      const hidden = details.classList.toggle('hidden');
      detailsBtn.textContent = hidden ? 'Show Details' : 'Hide Details';
      detailsBtn.setAttribute('aria-expanded', String(!hidden));
    });
  }

  // ================================================================
  // Back to top
  // ================================================================
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ================================================================
  // Typewriter hero
  // ================================================================
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

  // ================================================================
  // FAQ accordion — fixed accessibility + search filter
  // ================================================================
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        answer.style.maxHeight = '0';
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // FAQ search filter
  const faqSearch = document.getElementById('faq-search');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      const query = faqSearch.value.trim().toLowerCase();
      let anyVisible = false;
      document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-q');
        const ans = item.querySelector('.faq-a');
        const text = (btn.textContent + ' ' + ans.textContent).toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = '';
          anyVisible = true;
        } else {
          item.style.display = 'none';
        }
      });
      const noResults = document.getElementById('faq-no-results');
      if (noResults) noResults.classList.toggle('hidden', anyVisible);
    });
  }

  // ================================================================
  // Swiper (galleries)
  // ================================================================
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

  // ================================================================
  // AOS init
  // ================================================================
  function initAOS() { if (window.AOS) AOS.init({ once: true, offset: 100 }); else setTimeout(initAOS, 100); }
  initAOS();

  // ================================================================
  // Live stats via Roblox API (with demo mode fallback)
  // ================================================================
  const BADGE = document.getElementById('live-badge');
  const LIVE_COUNT = document.getElementById('live-count');
  const STAT_PLAYERS = document.getElementById('stat-players');
  const STAT_VISITS = document.getElementById('stat-visits');
  const STAT_FAV = document.getElementById('stat-fav');
  const STATS_NOTE_TEXT = document.getElementById('stats-note-text');

  let statsMode = 'live';
  let statsChartInstance = null;

  const PROXIES = [
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => u,
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

  // Demo mode data (simulated)
  function setDemoStats() {
    const demoPlayers = Math.floor(Math.random() * 140 + 50);
    const demoVisits = 4523400 + Math.floor(Math.random() * 10000);
    const demoFav = 18200 + Math.floor(Math.random() * 100);
    if (STAT_PLAYERS) STAT_PLAYERS.textContent = fmt(demoPlayers);
    if (STAT_VISITS) STAT_VISITS.textContent = fmt(demoVisits);
    if (STAT_FAV) STAT_FAV.textContent = fmt(demoFav);
    if (LIVE_COUNT) LIVE_COUNT.textContent = fmt(demoPlayers);
    if (BADGE) BADGE.hidden = false;
    if (STATS_NOTE_TEXT) STATS_NOTE_TEXT.textContent = 'Demo mode: The Roblox game is content-restricted, so simulated numbers are shown. Toggle to Live to try the real API.';
    initStatsChart(true);
  }

  async function refreshLiveStats() {
    if (statsMode === 'demo') { setDemoStats(); return; }
    if (STAT_PLAYERS) STAT_PLAYERS.textContent = '…';
    if (STATS_NOTE_TEXT) STATS_NOTE_TEXT.textContent = 'Fetching live data from the Roblox API…';
    try {
      const data = await fetchJSON(`https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`);
      const g = (data && data.data && data.data[0]) || null;
      if (!g || g.name.includes('UNAVAILABLE') || g.isContentRestricted) {
        // Game is content-restricted
        if (STAT_PLAYERS) STAT_PLAYERS.textContent = '—';
        if (STAT_VISITS) STAT_VISITS.textContent = '—';
        if (STAT_FAV) STAT_FAV.textContent = '—';
        if (LIVE_COUNT) LIVE_COUNT.textContent = 'unavailable';
        if (BADGE) BADGE.hidden = false;
        if (STATS_NOTE_TEXT) {
          STATS_NOTE_TEXT.innerHTML = 'The Roblox game is content-restricted, so live stats are unavailable. <button id="auto-demo" class="link-btn" type="button">Switch to Demo data</button>';
          const autoDemo = document.getElementById('auto-demo');
          if (autoDemo) autoDemo.addEventListener('click', () => {
            switchStatsMode('demo');
          });
        }
        initStatsChart(false);
        return;
      }
      if (STAT_PLAYERS) STAT_PLAYERS.textContent = fmt(g.playing);
      if (STAT_VISITS) STAT_VISITS.textContent = fmt(g.visits);
      if (STAT_FAV) STAT_FAV.textContent = fmt(g.favoritedCount);
      if (LIVE_COUNT) LIVE_COUNT.textContent = fmt(g.playing);
      if (BADGE) BADGE.hidden = false;
      if (STATS_NOTE_TEXT) STATS_NOTE_TEXT.textContent = 'Live data from the Roblox API.';
      initStatsChart(false, g.playing);
    } catch (e) {
      if (STAT_PLAYERS) STAT_PLAYERS.textContent = '—';
      if (LIVE_COUNT) LIVE_COUNT.textContent = 'unavailable';
      if (BADGE) BADGE.hidden = false;
      if (STATS_NOTE_TEXT) STATS_NOTE_TEXT.textContent = 'Could not reach the Roblox API. Try Demo mode.';
    }
  }

  function switchStatsMode(mode) {
    statsMode = mode;
    const liveBtn = document.getElementById('stats-mode-live');
    const demoBtn = document.getElementById('stats-mode-demo');
    if (liveBtn) liveBtn.classList.toggle('active', mode === 'live');
    if (demoBtn) demoBtn.classList.toggle('active', mode === 'demo');
    if (mode === 'demo') {
      setDemoStats();
    } else {
      refreshLiveStats();
    }
  }

  const liveModeBtn = document.getElementById('stats-mode-live');
  const demoModeBtn = document.getElementById('stats-mode-demo');
  if (liveModeBtn) liveModeBtn.addEventListener('click', () => switchStatsMode('live'));
  if (demoModeBtn) demoModeBtn.addEventListener('click', () => switchStatsMode('demo'));

  const refreshBtn = document.getElementById('refresh-stats');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    if (statsMode === 'live') refreshLiveStats();
    else setDemoStats();
  });
  refreshLiveStats();

  // ================================================================
  // Chart.js stats chart (supports live + demo data)
  // ================================================================
  function withAlpha(color, alpha) {
    return color.startsWith('rgba') ? color.replace(/,\s*[\d.]+\)/, `, ${alpha})`) : color;
  }

  function initStatsChart(demo, livePlayerCount) {
    if (!window.Chart) return;
    const cv = document.getElementById('statsChart');
    if (!cv) return;

    if (statsChartInstance) statsChartInstance.destroy();

    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent').trim() || '#4a90e2';
    const text = cs.getPropertyValue('--text-muted').trim() || '#56657a';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let playerData;
    if (demo) {
      // Simulated growth with noise
      playerData = months.map((_, i) => {
        const base = 0.5 + i * 0.38;
        return +(base + Math.random() * 0.4).toFixed(1);
      });
    } else {
      playerData = [0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.1, 3.5, 3.9, 4.2, 4.6, 5.0];
      if (livePlayerCount != null) {
        // use live count in last cell
        playerData[11] = +(livePlayerCount / 1000).toFixed(1);
      }
    }

    statsChartInstance = new Chart(cv, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: demo ? 'Monthly active players (thousands, demo)' : 'Monthly active players (thousands)',
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

  // ================================================================
  // Interactive Roadmap with voting (localStorage)
  // ================================================================
  const ROADMAP_ITEMS = [
    { id: 'rm-1', title: 'Co-op Cargo (2-player teams)', emoji: '🚚', phase: 'In Progress', votes: 47 },
    { id: 'rm-2', title: 'Weather system (rain, snow, storms)', emoji: '🌧️', phase: 'Planned', votes: 32 },
    { id: 'rm-3', title: 'Cargo market & trading', emoji: '📦', phase: 'Planned', votes: 28 },
    { id: 'rm-4', title: 'Truck skins workshop & paint shop', emoji: '🎨', phase: 'In Progress', votes: 41 },
    { id: 'rm-5', title: 'Seasonal events & limited-time maps', emoji: '🎄', phase: 'Planned', votes: 35 },
    { id: 'rm-6', title: 'Spectator mode for tournaments', emoji: '👁️', phase: 'Considering', votes: 19 },
  ];

  const roadmapList = document.getElementById('roadmap-list');
  if (roadmapList) {
    const storedVotes = JSON.parse(localStorage.getItem('mc-roadmap-votes') || '{}');
    const userVoted = JSON.parse(localStorage.getItem('mc-user-voted') || '[]');

    const phaseColors = {
      'In Progress': { bg: 'var(--accent-soft)', color: 'var(--accent-dark)', label: '🏗️ In Progress' },
      'Planned': { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: '📋 Planned' },
      'Considering': { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', label: '🤔 Considering' },
    };

    roadmapList.innerHTML = ROADMAP_ITEMS.map(item => {
      const votes = storedVotes[item.id] != null ? storedVotes[item.id] : item.votes;
      const voted = userVoted.includes(item.id);
      const pc = phaseColors[item.phase] || phaseColors['Planned'];
      return `
        <div class="roadmap-item" data-id="${item.id}">
          <div class="rm-emoji">${item.emoji}</div>
          <div class="rm-info">
            <h3>${item.title}</h3>
            <span class="rm-phase" style="background:${pc.bg};color:${pc.color}">${pc.label}</span>
          </div>
          <button class="rm-vote-btn ${voted ? 'voted' : ''}" data-id="${item.id}" type="button">
            <span class="rm-heart">${voted ? '❤️' : '🤍'}</span>
            <span class="rm-vote-count">${votes}</span>
          </button>
        </div>`;
    }).join('');

    roadmapList.querySelectorAll('.rm-vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const countEl = btn.querySelector('.rm-vote-count');
        const heartEl = btn.querySelector('.rm-heart');
        const storedVotes = JSON.parse(localStorage.getItem('mc-roadmap-votes') || '{}');
        let userVoted = JSON.parse(localStorage.getItem('mc-user-voted') || '[]');
        const item = ROADMAP_ITEMS.find(i => i.id === id);
        const baseVotes = storedVotes[id] != null ? storedVotes[id] : item.votes;

        if (userVoted.includes(id)) {
          // Unvote
          userVoted = userVoted.filter(v => v !== id);
          storedVotes[id] = Math.max(0, baseVotes - 1);
          btn.classList.remove('voted');
          heartEl.textContent = '🤍';
          showToast('Vote removed — you can vote again anytime');
        } else {
          userVoted.push(id);
          storedVotes[id] = baseVotes + 1;
          btn.classList.add('voted');
          heartEl.textContent = '❤️';
          showToast('Thanks for voting ❤️');
        }
        localStorage.setItem('mc-roadmap-votes', JSON.stringify(storedVotes));
        localStorage.setItem('mc-user-voted', JSON.stringify(userVoted));
        countEl.textContent = storedVotes[id];
      });
    });
  }

  // ================================================================
  // Cargo-sorting mini-game
  // ================================================================
  const gameBoard = document.getElementById('cargo-mini-game');
  if (gameBoard) {
    function initMiniGame() {
      const cargoTypes = [
        { emoji: '📦', label: 'Box', color: 'var(--accent)' },
        { emoji: '🛢️', label: 'Drum', color: '#f97316' },
        { emoji: '🧰', label: 'Crate', color: '#a855f7' },
        { emoji: '📦', label: 'Box', color: 'var(--accent)' },
        { emoji: '🛢️', label: 'Drum', color: '#f97316' },
        { emoji: '🧰', label: 'Crate', color: '#a855f7' },
        { emoji: '📦', label: 'Box', color: 'var(--accent)' },
        { emoji: '🛢️', label: 'Drum', color: '#f97316' },
      ];

      // Shuffle
      for (let i = cargoTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cargoTypes[i], cargoTypes[j]] = [cargoTypes[j], cargoTypes[i]];
      }

      const sortedEl = document.getElementById('mg-sorted');
      const timeEl = document.getElementById('mg-time');
      const restartBtn = document.getElementById('mg-restart');
      let sorted = 0;
      let startTime = Date.now();
      let timerInterval = null;
      let active = null;

      function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (timeEl) timeEl.textContent = elapsed;
      }

      gameBoard.innerHTML = '';
      sorted = 0;
      if (sortedEl) sortedEl.textContent = '0';
      if (timeEl) timeEl.textContent = '0';
      startTime = Date.now();
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);

      cargoTypes.forEach((cargo, i) => {
        const el = document.createElement('div');
        el.className = 'cargo-box';
        el.textContent = cargo.emoji;
        el.dataset.label = cargo.label;
        el.style.borderColor = cargo.color;
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `${cargo.emoji} ${cargo.label} — click to sort into a group`);

        function handleSort() {
          if (el.classList.contains('sorted')) return;
          if (!active) {
            // First selection
            active = el;
            el.classList.add('selected');
          } else if (active === el) {
            // Deselect
            el.classList.remove('selected');
            active = null;
          } else if (active.dataset.label === el.dataset.label) {
            // Match! Sort both
            active.classList.remove('selected');
            active.classList.add('sorted');
            el.classList.add('sorted');
            sorted += 2;
            if (sortedEl) sortedEl.textContent = String(sorted);
            active = null;
            if (sorted >= cargoTypes.length) {
              clearInterval(timerInterval);
              const finalTime = Math.floor((Date.now() - startTime) / 1000);
              showToast(`🎉 All sorted in ${finalTime}s! Great job!`);
            }
          } else {
            // Mismatch — shake both
            active.classList.add('shake');
            el.classList.add('shake');
            setTimeout(() => {
              active.classList.remove('selected', 'shake');
              el.classList.remove('shake');
              active = null;
            }, 400);
          }
        }

        el.addEventListener('click', handleSort);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(); }
        });
        gameBoard.appendChild(el);
      });

      if (restartBtn) {
        restartBtn.onclick = () => initMiniGame();
      }
    }

    initMiniGame();
  }

  // ================================================================
  // Notification toast system (rotating tips)
  // ================================================================
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastClose = document.getElementById('toast-close');
  let toastTimer = null;

  const TIPS = [
    '💡 Tip: Try the cargo sorting mini-game at the top!',
    '🚚 New: Vote on the roadmap — your voice shapes the game!',
    '🐛 Found a bug? Report it on the Collaborate page.',
    '❤️ Press ↑↑↓↓←→←→BA on your keyboard for a surprise…',
    '🌙 Try the dark mode toggle in the nav bar!',
    '🎮 The Roblox game is content-restricted — switch stats to Demo mode to see the chart!',
  ];

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.removeAttribute('hidden');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('hidden', '');
    }, 4000);
  }

  if (toastClose) {
    toastClose.addEventListener('click', () => {
      toast.classList.remove('show');
      toast.setAttribute('hidden', '');
      clearTimeout(toastTimer);
    });
  }

  // Rotate tips every 12 seconds (after first appearing at 4s)
  let tipIndex = 0;
  setTimeout(() => {
    setInterval(() => {
      tipIndex = (tipIndex + 1) % TIPS.length;
      showToast(TIPS[tipIndex]);
    }, 14000);
  }, 5000);

  // ================================================================
  // Konami code easter egg → confetti
  // ================================================================
  (function konamiCode() {
    const KEY = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === KEY[pos]) {
        pos++;
        if (pos === KEY.length) {
          pos = 0;
          launchConfetti();
        }
      } else {
        pos = 0;
      }
    });

    function launchConfetti() {
      showToast('🎉 KONAMI! Cargo party activated!');
      const cargoEmojis = ['📦', '🛢️', '🧰', '🚚', '🏆', '✨', '🎉'];
      const confettiContainer = document.createElement('div');
      confettiContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.textContent = cargoEmojis[Math.floor(Math.random() * cargoEmojis.length)];
        el.style.cssText = `
          position:absolute;font-size:${1.5 + Math.random() * 2}rem;
          left:${Math.random() * 100}%;top:-30px;
          transition:transform 3s ease-in,opacity 3s ease-in;pointer-events:none;`;
        confettiContainer.appendChild(el);
        requestAnimationFrame(() => {
          el.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`;
          el.style.opacity = '0';
        });
      }
      setTimeout(() => confettiContainer.remove(), 3500);
    }
  })();

  // ================================================================
  // Trailer "notify me" feature
  // ================================================================
  const notifyBtn = document.getElementById('notify-trailer');
  if (notifyBtn) {
    const notified = localStorage.getItem('mc-trailer-notify');
    if (notified) {
      notifyBtn.textContent = '✓ You\'ll be notified';
      notifyBtn.disabled = true;
    } else {
      notifyBtn.addEventListener('click', () => {
        localStorage.setItem('mc-trailer-notify', '1');
        notifyBtn.textContent = '✓ You\'ll be notified';
        notifyBtn.disabled = true;
        showToast('Got it! We\'ll let you know when the trailer goes live.');
      });
    }
  }

  // ================================================================
  // Collaborate form → redirect to GitHub Issues
  // ================================================================
  const collabForm = document.getElementById('collab-form');
  if (collabForm) {
    const ISSUE_REPO = 'l-amb/mini-cargo-site';

    function buildTitle(name, type) {
      return `[Game Collab] ${type} — from ${name || 'Anonymous'}`;
    }

    function buildBody(name, contact, type, message, portfolio) {
      return [
        '## 🎮 Collaboration Request for the Mini Cargo Roblox Game',
        '',
        '> **Note to maintainers:** This is a request to collaborate on the **Mini Cargo game** (level design, art, music, scripting, features, partnerships, bug reports, etc.), not a request to contribute to this website source code. Label with `game-collab`.',
        '',
        '| Field | Value |',
        '|---|---|',
        `| **Name / Handle** | ${name || '_(not provided)_'} |`,
        `| **Contact** | ${contact || '_(not provided)_'} |`,
        `| **Request type** | ${type} |`,
        `| **Portfolio / Work** | ${portfolio || '_(not provided)_'} |`,
        '',
        '### 📝 Proposal',
        '',
        message || '_(no message provided)_',
        '',
        '---',
        '_This request was submitted via the Mini Cargo website Collaborate form._',
        '_It is a collab-with-game request (level design, art, music, features, partnerships, testing, scripting, etc.), not a request to contribute to the website source code._',
      ].join('\n');
    }

    collabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('collab-status');
      const submitBtn = collabForm.querySelector('button[type="submit"]');
      const name = (document.getElementById('collab-name').value || '').trim();
      const contact = (document.getElementById('collab-contact').value || '').trim();
      const type = document.getElementById('collab-type').value;
      const portfolio = (document.getElementById('collab-portfolio')?.value || '').trim();
      const message = (document.getElementById('collab-message').value || '').trim();

      // Basic validation — message at least required
      if (!message) {
        status.className = 'form-status err';
        status.textContent = 'Please describe what you\'d like to contribute to the game.';
        status.style.display = 'block';
        return;
      }

      const title = buildTitle(name, type);
      const body = buildBody(name, contact, type, message, portfolio);

      const url = `https://github.com/${ISSUE_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

      status.className = 'form-status ok';
      status.innerHTML = `Launching GitHub to publish your game collab request as an issue&hellip; (if nothing opens, <a href="${url}" target="_blank" rel="noopener">click here</a>.) No GitHub account? Drop the same message in our <a href="https://discord.com/invite/mini-cargo" target="_blank" rel="noopener">Discord</a> instead.`;
      status.style.display = 'block';
      submitBtn.disabled = true;

      window.open(url, '_blank', 'noopener');

      setTimeout(() => { submitBtn.disabled = false; }, 2500);
    });
  }

  // ================================================================
  // FAQ question forwarding: clicking the bug-report FAQ shows tip
  // ================================================================
  document.querySelectorAll('.faq-q').forEach(q => {
    if (q.textContent.includes('report bugs')) {
      q.addEventListener('click', () => {
        setTimeout(() => showToast('🐛 Tip: Use the Collaborate page and select "Bug report" for a structured report.'), 300);
      });
    }
  });

})();
