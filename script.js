// Canvas particle background reacting to mouse
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

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    // Move particle
    p.x += p.speedX;
    p.y += p.speedY;
    // Wrap around edges
    if (p.x > canvas.width) p.x = 0;
    if (p.x < 0) p.x = canvas.width;
    if (p.y > canvas.height) p.y = 0;
    if (p.y < 0) p.y = canvas.height;
    // Interaction with mouse
    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        // Repel away from mouse
        const angle = Math.atan2(dy, dx);
        p.x += Math.cos(angle) * 2;
        p.y += Math.sin(angle) * 2;
        p.size = Math.min(p.baseSize + 2, 6);
      } else {
        p.size = p.baseSize;
      }
    }
    ctx.fillStyle = 'rgba(74,144,226,0.6)'; // accent color with opacity
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();

// Existing scroll‑into‑view and details toggle
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  document.querySelectorAll('.content-section').forEach(section => observer.observe(section));

  const detailsBtn = document.querySelector('.details-btn');
  const details = document.querySelector('.details');
  if (detailsBtn && details) {
    detailsBtn.addEventListener('click', () => {
      details.classList.toggle('hidden');
      detailsBtn.textContent = details.classList.contains('hidden') ? 'Show Details' : 'Hide Details';
    });
  }
});
