/**
 * FASHWAY — Luxury Textile Atelier Interactive Controller
 * Powers navigation, hero showcase slider, category filtering,
 * quick-view modal, swatch selection bag, and scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroSlider();
  initProductFilters();
  initQuickViewModal();
  initSwatchList();
  initScrollAnimations();
  initForms();
});

/* ---------- 1. Navigation & Sticky Header ---------- */
function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ---------- 2. Hero Showcase Slider ---------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length < 2) return;

  let current = 0;
  let timer = null;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(() => {
      goToSlide(current + 1);
    }, 6500);
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = Number(dot.getAttribute('data-target') || 0);
      goToSlide(target);
      startAutoPlay();
    });
  });

  startAutoPlay();
}

/* ---------- 3. Product Category Filtering ---------- */
function initProductFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.product-card');
  const categoryTriggers = document.querySelectorAll('[data-filter-trigger]');

  function applyFilter(filter) {
    tabBtns.forEach(btn => {
      const active = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const match = filter === 'all' || category === filter;
      card.classList.toggle('hidden', !match);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter') || 'all');
    });
  });

  categoryTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetFilter = trigger.getAttribute('data-filter-trigger');
      if (targetFilter) {
        applyFilter(targetFilter);
      }
    });
  });
}

/* ---------- 4. Quick View Modal ---------- */
function initQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  const closeBtn = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalSpec = document.getElementById('modal-spec');
  const modalDesc = document.getElementById('modal-desc');
  const inquireBtn = document.getElementById('modal-inquire-btn');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.btn-quick-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;

      const title = card.getAttribute('data-title') || '';
      const spec = card.getAttribute('data-spec') || '';
      const desc = card.getAttribute('data-desc') || '';
      const img = card.getAttribute('data-img') || '';

      if (modalTitle) modalTitle.textContent = title;
      if (modalSpec) modalSpec.textContent = spec;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalImg) {
        modalImg.src = img;
        modalImg.alt = title;
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  inquireBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ---------- 5. Swatch Selection List ---------- */
function initSwatchList() {
  const selected = new Set();
  const bagCount = document.getElementById('bag-count');
  const bagBtn = document.getElementById('swatch-bag-btn');
  const banner = document.getElementById('selected-swatches-banner');
  const listEl = document.getElementById('selected-swatches-list');
  const messageInput = document.getElementById('message');

  function renderSwatches() {
    if (bagCount) bagCount.textContent = String(selected.size);

    if (!banner || !listEl) return;
    if (selected.size === 0) {
      banner.hidden = true;
      listEl.innerHTML = '';
      return;
    }

    banner.hidden = false;
    listEl.innerHTML = '';
    selected.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'swatch-chip';
      chip.innerHTML = `${item} <button type="button" aria-label="Remove ${item}">&times;</button>`;
      chip.querySelector('button')?.addEventListener('click', () => {
        selected.delete(item);
        updateButtons();
        renderSwatches();
      });
      listEl.appendChild(chip);
    });
  }

  function updateButtons() {
    document.querySelectorAll('.btn-add-swatch').forEach(btn => {
      const name = btn.getAttribute('data-swatch') || '';
      const has = selected.has(name);
      btn.classList.toggle('added', has);
      btn.textContent = has ? '✓ In Swatch List' : '+ Swatch List';
    });
  }

  document.querySelectorAll('.btn-add-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-swatch');
      if (!name) return;

      if (selected.has(name)) {
        selected.delete(name);
      } else {
        selected.add(name);
      }
      updateButtons();
      renderSwatches();
    });
  });

  bagBtn?.addEventListener('click', () => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
    if (selected.size > 0 && messageInput && !messageInput.value.trim()) {
      messageInput.value = `I would like to request physical swatches for: ${Array.from(selected).join(', ')}.`;
    }
  });
}

/* ---------- 6. Scroll Reveal Animations ---------- */
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.pillar-item, .category-card, .product-card, .step-item, .stat-card, .review-card, .info-card, .section-header'
  );

  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(t => observer.observe(t));
}

/* ---------- 7. Contact & Newsletter Forms ---------- */
function initForms() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.textContent;
      btn.textContent = 'Transmitting to Atelier...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Inquiry Received — We Will Reply Shortly';
        btn.style.backgroundColor = '#2C4A34';
        btn.style.borderColor = '#2C4A34';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }, 1000);
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.textContent;
      btn.textContent = 'Welcome to Fashway ✦';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        newsletterForm.reset();
      }, 2800);
    });
  }
}
