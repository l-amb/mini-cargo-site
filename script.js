// Simple scroll‑into‑view animation
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

  // Toggle details in latest update card
  const detailsBtn = document.querySelector('.details-btn');
  const details = document.querySelector('.details');
  if (detailsBtn && details) {
    detailsBtn.addEventListener('click', () => {
      details.classList.toggle('hidden');
      detailsBtn.textContent = details.classList.contains('hidden') ? 'Show Details' : 'Hide Details';
    });
  }
});
