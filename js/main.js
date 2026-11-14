/**
 * FASHWAY — Interactive Controller
 * Powers sticky nav, mobile menu, collection filtering, quick-view modal,
 * swatch selection list, scroll reveal, and sample inquiry form.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
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
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

/* ---------- 2. Product Category Filtering ---------- */
function initProductFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.product-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';
      tabBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });

      cards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });
}

/* ---------- 3. Quick View Modal ---------- */
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
      if (modalTitle) modalTitle.textContent = title;
      if (modalSpec) modalSpec.textContent = card.getAttribute('data-spec') || '';
      if (modalDesc) modalDesc.textContent = card.getAttribute('data-desc') || '';
      if (modalImg) {
        modalImg.src = card.getAttribute('data-img') || '';
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
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ---------- 4. Swatch Selection List ---------- */
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
      chip.textContent = item + ' ';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove ${item}`);
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', () => {
        selected.delete(item);
        updateButtons();
        renderSwatches();
      });
      chip.appendChild(removeBtn);
      listEl.appendChild(chip);
    });
  }

  function updateButtons() {
    document.querySelectorAll('.btn-add-swatch').forEach(btn => {
      const name = btn.getAttribute('data-swatch') || '';
      const has = selected.has(name);
      btn.classList.toggle('added', has);
      btn.textContent = has ? '✓ Added' : '+ Swatch';
    });
  }

  document.querySelectorAll('.btn-add-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-swatch');
      if (!name) return;
      if (selected.has(name)) selected.delete(name);
      else selected.add(name);
      updateButtons();
      renderSwatches();
    });
  });

  bagBtn?.addEventListener('click', () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    if (selected.size > 0 && messageInput && !messageInput.value.trim()) {
      messageInput.value = `I would like to request physical swatches for: ${Array.from(selected).join(', ')}.`;
    }
  });
}

/* ---------- 5. Scroll Reveal Animations ---------- */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.spec-card, .pillar-card, .product-card');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(t => observer.observe(t));
}

/* ---------- 6. Sample Inquiry Form ---------- */
function initForms() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Inquiry Received — We Will Reply Shortly';
      btn.style.backgroundColor = '#1E7E45';
      btn.style.borderColor = '#1E7E45';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        contactForm.reset();
      }, 3000);
    }, 800);
  });
}
