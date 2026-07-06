/* ═══════════════════════════════════════════════════════════════
   FERIENWOHNUNG — Page-specific JS
   ═══════════════════════════════════════════════════════════════ */
'use strict';

// Tilt effect for room image frames
document.querySelectorAll('.room__img-frame').forEach(frame => {
  frame.addEventListener('mousemove', (e) => {
    const rect  = frame.getBoundingClientRect();
    const x     = e.clientX - rect.left;
    const y     = e.clientY - rect.top;
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    const tiltX = ((y - cy) / cy) * 5;
    const tiltY = ((x - cx) / cx) * -5;
    frame.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
  });
  frame.addEventListener('mouseleave', () => {
    frame.style.transform = '';
  });
});

// Pricing card hover glow
document.querySelectorAll('.pricing__card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(201,169,110,0.07) 0%, transparent 60%), var(--dark)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// Animate balcony mountain parallax
const balconyBg = document.querySelector('.balcony-section__bg');
if (balconyBg) {
  window.addEventListener('scroll', () => {
    const section = document.querySelector('.balcony-section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const progress = -rect.top / window.innerHeight;
    if (progress > -1 && progress < 2) {
      balconyBg.style.transform = `translateY(${progress * 30}px)`;
    }
  }, { passive: true });
}
