// Canvas particle background (mouse‑reactive)
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = Math.min(window.innerWidth / 10, 120);
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
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      baseSize: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    });
  }
}
initParticles();

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x > canvas.width) p.x = 0;
    if (p.x < 0) p.x = canvas.width;
    if (p.y > canvas.height) p.y = 0;
    if (p.y < 0) p.y = canvas.height;
    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const angle = Math.atan2(dy, dx);
        p.x += Math.cos(angle) * 2;
        p.y += Math.sin(angle) * 2;
        p.size = Math.min(p.baseSize + 2, 6);
      } else {
        p.size = p.baseSize;
      }
    }
    ctx.fillStyle = 'rgba(74,144,226,0.6)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Scroll‑into‑view fade using IntersectionObserver (fallback if AOS not loaded)
function setupObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.content-section').forEach(section => observer.observe(section));
}
setupObserver();

// Details toggle for latest update card
const detailsBtn = document.querySelector('.details-btn');
const details = document.querySelector('.details');
if (detailsBtn && details) {
  detailsBtn.addEventListener('click', () => {
    details.classList.toggle('hidden');
    detailsBtn.textContent = details.classList.contains('hidden') ? 'Show Details' : 'Hide Details';
  });
}

// Back to top button
const backBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backBtn.classList.add('show');
  } else {
    backBtn.classList.remove('show');
  }
});
backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Typewriter effect for hero title
const typewriterEl = document.getElementById('typewriter');
const typeTexts = ['Welcome to Mini Cargo!', 'Your cargo adventure awaits!', 'Play, compete, collaborate!'];
let ti = 0, tiChar = 0, typing = true;
function type() {
  if (!typewriterEl) return;
  if (typing) {
    typewriterEl.textContent = typeTexts[ti].slice(0, tiChar + 1);
    tiChar++;
    if (tiChar === typeTexts[ti].length) {
      typing = false;
      setTimeout(() => { typing = true; ti = (ti + 1) % typeTexts.length; tiChar = 0; }, 2000);
    }
  }
  setTimeout(type, 80);
}
type();

// Initialize AOS (Animate On Scroll) when script loaded
function initAOS() {
  if (window.AOS) {
    AOS.init({ once: true, offset: 120 });
  } else {
    setTimeout(initAOS, 100);
  }
}
initAOS();

// Initialize Swiper carousels when library is ready
function initSwipers() {
  if (!window.Swiper) return;
  new Swiper('.mySwiper', {
    loop: true,
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    autoplay: { delay: 4000 },
  });
  new Swiper('.testimonialSwiper', {
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: { delay: 5000 },
  });
}
if (window.Swiper) {
  initSwipers();
} else {
  const swCheck = setInterval(() => {
    if (window.Swiper) { clearInterval(swCheck); initSwipers(); }
  }, 100);
}

// Initialize Chart.js for live stats when library is ready
function initStatsChart() {
  if (!window.Chart) return;
  const ctx = document.getElementById('statsChart').getContext('2d');
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Players (k)',
      data: [0.8,1.2,1.5,1.9,2.3,2.8,3.1,3.5,3.9,4.2,4.6,5.0],
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      backgroundColor: 'rgba(74,144,226,0.2)',
      tension: 0.4,
      fill: true,
    }]
  };
  new Chart(ctx, { type: 'line', data: data, options: { responsive: true, plugins: { legend: { display: false } } } });
}
if (window.Chart) {
  initStatsChart();
} else {
  const chCheck = setInterval(() => {
    if (window.Chart) { clearInterval(chCheck); initStatsChart(); }
  }, 100);
}
