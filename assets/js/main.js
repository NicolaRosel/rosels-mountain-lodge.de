/* ═══════════════════════════════════════════════════════════════════
   ROSEL'S MOUNTAIN LODGE — Premium JavaScript
   Lenis smooth scroll + GSAP ScrollTrigger
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ── LENIS SMOOTH SCROLL ──────────────────────────────────────────────
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.5,
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);
  }

  lenis.stop(); // paused until loader exits
}

// ── SPLIT TEXT UTILITIES ─────────────────────────────────────────────
function splitChars(el) {
  if (!el || el.dataset.split === 'done') return;
  const text = el.innerText;
  el.innerHTML = [...text].map(char =>
    char === ' '
      ? `<span class="char" style="display:inline-block;width:0.28em;">&nbsp;</span>`
      : `<span class="char" style="display:inline-block;">${char}</span>`
  ).join('');
  el.dataset.split = 'done';
}

function splitWords(el) {
  if (!el || el.dataset.split === 'done') return;
  // Preserve <em> and <br> tags, only split text nodes
  const nodes = [...el.childNodes];
  el.innerHTML = '';
  nodes.forEach(node => {
    if (node.nodeType === 3) { // text node
      const text = node.textContent;
      const hasLeading  = text.startsWith(' ');
      const hasTrailing = text.endsWith(' ');
      const words = text.split(' ').filter(w => w.length);
      if (hasLeading) el.appendChild(document.createTextNode(' '));
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
        const inner = document.createElement('span');
        inner.className = 'word__inner';
        inner.style.cssText = 'display:inline-block;';
        inner.textContent = word;
        span.appendChild(inner);
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      if (hasTrailing) el.appendChild(document.createTextNode(' '));
    } else {
      el.appendChild(node.cloneNode(true));
    }
  });
  el.dataset.split = 'done';
}

// ── HERO GSAP ENTRANCE TIMELINE ──────────────────────────────────────
function initHeroTimeline() {
  if (typeof gsap === 'undefined') return;

  const eyebrow = document.querySelector('.hero__card-eyebrow');
  const script  = document.querySelector('.hero__card-script');
  const lodge   = document.querySelector('.hero__card-lodge');
  const divider = document.querySelector('.hero__card-divider');
  const tagline = document.querySelector('.hero__card-tagline');
  const btns    = document.querySelectorAll('.hero__card-btn');

  if (!script) return;

  splitChars(script);
  gsap.set(script, { opacity: 1 }); // parent must be visible for char animation

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // BG: zoom out from scale 1.12
  tl.fromTo('.hero__parallax-bg',
    { scale: 1.1 },
    { scale: 1.0, duration: 2.5, ease: 'power2.out' },
    0
  );

  // Eyebrow
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 1.0 }, 0.2);
    gsap.set(eyebrow, { y: 14 });
  }

  // Script chars
  tl.fromTo('.hero__card-script .char',
    { opacity: 0, y: '80%', rotateZ: 5 },
    { opacity: 1, y: '0%', rotateZ: 0, duration: 1.1, stagger: 0.035, ease: 'back.out(1.2)' },
    0.5
  );

  // Lodge
  if (lodge) {
    gsap.set(lodge, { letterSpacing: '-0.02em', y: 10 });
    tl.to(lodge, { opacity: 1, letterSpacing: '0.45em', y: 0, duration: 1.2 }, 0.95);
  }

  // Divider
  if (divider) {
    tl.to(divider, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, 1.2);
  }

  // Tagline
  if (tagline) {
    gsap.set(tagline, { y: 10 });
    tl.to(tagline, { opacity: 1, y: 0, duration: 0.9 }, 1.45);
  }

  // Buttons
  btns.forEach((btn, i) => {
    gsap.set(btn, { y: 16, scale: 0.96 });
    tl.to(btn, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 1.65 + i * 0.1);
  });
}

// ── HERO PARALLAX ON SCROLL ──────────────────────────────────────────
function initParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.innerWidth < 768) return;

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set('.hero__parallax-bg', { y: p * 160, scale: 1 + p * 0.04 });
      gsap.set('.hero__card',        { opacity: Math.max(0, 1 - p * 2.2) });
    },
    onLeaveBack: () => {
      gsap.set('.hero__card', { opacity: 1 });
      gsap.set('.hero__parallax-bg', { y: 0, scale: 1 });
    }
  });
}

// ── SCROLL REVEAL (GSAP) ─────────────────────────────────────────────
function initScrollReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // CSS fallback — IntersectionObserver already handles .reveal-* classes
    return;
  }

  // Section titles: word-by-word
  document.querySelectorAll('.section__title').forEach(title => {
    splitWords(title);
    const words = title.querySelectorAll('.word__inner');
    if (!words.length) return;
    gsap.fromTo(words,
      { y: '110%' },
      {
        y: '0%',
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 88%', once: true }
      }
    );
  });

  // Apartment cards: stagger scale-in
  if (document.querySelector('.apartment__grid')) {
    gsap.fromTo('.apartment__card',
      { opacity: 0, y: 55, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.apartment__grid', start: 'top 82%', once: true }
      }
    );
  }

  // Gallery: clip-path reveal from bottom
  if (document.querySelector('.gallery__grid')) {
    gsap.fromTo('.gallery__item',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        stagger: 0.07,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.gallery__grid', start: 'top 82%', once: true }
      }
    );
  }

  // Season cards
  if (document.querySelector('.surroundings__seasons')) {
    gsap.fromTo('.season__card',
      { opacity: 0, y: 45 },
      {
        opacity: 1, y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.surroundings__seasons', start: 'top 83%', once: true }
      }
    );
  }

  // Testimonial cards
  if (document.querySelector('.testimonials__slider')) {
    gsap.fromTo('.testimonial__card',
      { opacity: 0, y: 35, scale: 0.98 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonials__slider', start: 'top 82%', once: true }
      }
    );
  }
}

// ── MAGNETIC BUTTONS ─────────────────────────────────────────────────
function initMagneticButtons() {
  if (typeof gsap === 'undefined') return;

  document.querySelectorAll('.hero__card-btn, .nav__link--cta, .btn--primary').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      gsap.to(el, { x: dx * 10, y: dy * 10, duration: 0.4, ease: 'power2.out' });
      el.style.setProperty('--btn-x', (e.clientX - rect.left) + 'px');
      el.style.setProperty('--btn-y', (e.clientY - rect.top)  + 'px');
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1.1, 0.4)' });
    });
  });
}

// ── CARD TILT (GSAP) ─────────────────────────────────────────────────
function initCardTilt() {
  document.querySelectorAll('.apartment__card, .season__card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotateY: x * 8, rotateX: -y * 8,
          duration: 0.5, ease: 'power2.out',
          transformPerspective: 900,
        });
      }

      card.style.setProperty('--shine-x', ((x + 0.5) * 100) + '%');
      card.style.setProperty('--shine-y', ((y + 0.5) * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      } else {
        card.style.transform = '';
      }
    });
  });
}

// ── LOADER ──────────────────────────────────────────────────────────
const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  initLenis();

  // Phase 1: inner fades
  setTimeout(() => {
    const inner = loader.querySelector('.loader__inner');
    if (inner) inner.style.opacity = '0';
  }, 1100);

  // Phase 2: curtain wipe
  setTimeout(() => {
    loader.classList.add('hide');

    if (lenis) lenis.start();

    initHeroTimeline();
    initParticles();
    initCounters();
    initParallax();
    initScrollReveal();
    initMagneticButtons();
    initCardTilt();

    // Gallery cursor state
    document.querySelectorAll('.gallery__item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-gallery');
        document.body.classList.remove('cursor-hover');
      });
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-gallery'));
    });

  }, 1700);

  // Phase 3: remove loader
  setTimeout(() => loader.classList.add('gone'), 2900);
});

// ── CUSTOM CURSOR ────────────────────────────────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateCursorFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateCursorFollower);
})();

document.querySelectorAll('a, button, .apartment__card, .gallery__item, .season__card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── NAVIGATION ───────────────────────────────────────────────────────
const nav        = document.getElementById('nav');
const navBurger  = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navBurger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Smooth anchor scroll (Lenis or native)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -(nav.offsetHeight + 20), duration: 1.8 });
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ── PARTICLES ────────────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = window.innerWidth > 768 ? 28 : 12;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;bottom:-10px;
      animation-duration:${Math.random() * 15 + 10}s;
      animation-delay:${Math.random() * 10}s;
      --drift:${(Math.random() - 0.5) * 100}px;
      opacity:${Math.random() * 0.5 + 0.15};
    `;
    container.appendChild(p);
  }
}

// ── SCROLL REVEAL (CSS fallback via IntersectionObserver) ────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    el.classList.add('revealed');
  } else {
    revealObserver.observe(el);
  }
});

// ── COUNTER ANIMATION ────────────────────────────────────────────────
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const step   = target / (2000 / 16);
    let current  = 0;
    const update = () => {
      current += step;
      counter.textContent = current < target ? Math.floor(current) : target;
      if (current < target) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ── TESTIMONIALS SLIDER ──────────────────────────────────────────────
const track      = document.getElementById('testimonialTrack');
const dots       = document.querySelectorAll('.dot');
const prevBtn    = document.getElementById('tPrev');
const nextBtn    = document.getElementById('tNext');
let currentSlide = 0;
const totalSlides = document.querySelectorAll('.testimonial__card').length;
let autoSlide;

function goToSlide(index) {
  if (!track || totalSlides === 0) return;
  currentSlide = (index + totalSlides) % totalSlides;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}
function startAutoSlide() {
  if (!track || totalSlides === 0) return;
  autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
}
function stopAutoSlide() { clearInterval(autoSlide); }

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide - 1); startAutoSlide(); });
  nextBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide + 1); startAutoSlide(); });
}
dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAutoSlide(); goToSlide(i); startAutoSlide(); }));

let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAutoSlide(); goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1); startAutoSlide(); }
  });
}
startAutoSlide();

// ── BACK TO TOP ───────────────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── HIGHLIGHT BAND ────────────────────────────────────────────────────
const bandTrack = document.querySelector('.highlight-band__track');
if (bandTrack) {
  bandTrack.addEventListener('mouseenter', () => { bandTrack.style.animationPlayState = 'paused'; });
  bandTrack.addEventListener('mouseleave', () => { bandTrack.style.animationPlayState = 'running'; });
}

// ── NAV ACTIVE LINK ───────────────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) link.classList.add('active');
      });
    }
  });
}, { threshold: 0.4 }).observe && document.querySelectorAll('section[id]').forEach(s => {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) link.classList.add('active');
        });
      }
    });
  }, { threshold: 0.4 }).observe(s);
});

// ── FAQ ACCORDION ─────────────────────────────────────────────────────
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq__q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── DATE PICKER ───────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(input => input.setAttribute('min', today));

// ── BOOKING FORM ──────────────────────────────────────────────────────
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button[type="submit"]');
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<span>Anfrage gesendet!</span> <i class="fa-solid fa-check"></i>';
    btn.style.background = '#4a8a4a';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.style.background = '';
      btn.disabled = false;
      bookingForm.reset();
    }, 3500);
  });
}

// ── COOKIE BANNER & GOOGLE ANALYTICS ─────────────────────────────────
(function () {
  var CONSENT_KEY = 'rml_cookie_consent';
  var GA_ID       = 'G-HTMN9XBCZQ';

  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  var banner    = document.getElementById('cookieBanner');
  var btnAccept = document.getElementById('cookieAccept');
  var btnDeny   = document.getElementById('cookieDeny');
  var consent   = localStorage.getItem(CONSENT_KEY);

  if (consent === 'granted') { loadGA(); }
  else if (!consent && banner) { setTimeout(() => banner.classList.add('show'), 2000); }

  if (btnAccept) btnAccept.addEventListener('click', () => { localStorage.setItem(CONSENT_KEY, 'granted'); banner.classList.remove('show'); loadGA(); });
  if (btnDeny)   btnDeny.addEventListener('click',   () => { localStorage.setItem(CONSENT_KEY, 'denied');  banner.classList.remove('show'); });
})();

// ── CONSOLE ───────────────────────────────────────────────────────────
console.log('%c🏔️ Rosel\'s Mountain Lodge', 'color:#C49A8B; font-family: serif; font-size: 24px; font-weight: bold;');
console.log('%cDesigned with premium care · Oberaudorf · Kaisergebirge', 'color:#8a8a8a; font-size: 12px;');
