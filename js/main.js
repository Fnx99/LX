/**
 * LOOMX MILL - Main Interactive Controller
 * Lightweight Vanilla JS for high performance & GitHub Pages compatibility
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initSwatchFilter();
  initSwatchModal();
  initInquiryForm();
  initFaqAccordion();
});

/* ==========================================================================
   1. THEME TOGGLE (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('loomx-theme') || (prefersDark ? 'dark' : 'dark'); // default dark

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('loomx-theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const sunIcon = document.getElementById('icon-sun');
  const moonIcon = document.getElementById('icon-moon');
  if (sunIcon && moonIcon) {
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

/* ==========================================================================
   2. NAVIGATION & SMOOTH SCROLL
   ========================================================================== */
function initNavigation() {
  const siteNav = document.getElementById('site-nav');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  // Sticky navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteNav.classList.add('scrolled');
    } else {
      siteNav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNav = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (targetNav) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNav.classList.add('active');
        } else {
          targetNav.classList.remove('active');
        }
      }
    });
  });
}

/* ==========================================================================
   3. SWATCH FILTERING
   ========================================================================== */
function initSwatchFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const swatchCards = document.querySelectorAll('.swatch-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      swatchCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. SWATCH QUICK-VIEW MODAL
   ========================================================================== */
const swatchesData = {
  'pearl-cloud': {
    name: 'Play Boa - Pearl Cloud Ivory',
    category: 'Play Boa Series',
    gsm: '320 GSM',
    pile: '12mm - 14mm Curly Tuft',
    width: '58" - 60" (150cm)',
    backing: 'Industrial Warp Knit Fiber-Lock',
    applications: 'High-end plush toys, footwear lining, designer coats, pet accessories',
    moq: '300 Meters (Custom roll lengths available)',
    description: 'Ultra-soft, curled Play Boa fabric engineered with proprietary anti-shedding backing. Retains cloud-like loft and plush volume after heavy wash cycles and industrial processing.',
    image: 'assets/images/playboa-ivory.jpg'
  },
  'crimson-fur': {
    name: 'Play Boa - Crimson Silk-Fur',
    category: 'Play Boa Series',
    gsm: '380 GSM',
    pile: '18mm - 20mm Straight Luxe Pile',
    width: '58" - 60" (150cm)',
    backing: 'Reinforced Interlock Poly Backing',
    applications: 'Outerwear trims, luxury collars, high-fashion winterwear, premium cushions',
    moq: '300 Meters',
    description: 'Vibrant deep-crimson tone with high-sheen synthetic silk touch. Exceptional depth of color and colorfastness Grade 4.5+ under ISO standards.',
    image: 'assets/images/crimson-boa.jpg'
  },
  'saffron-shag': {
    name: 'Play Boa - Saffron Amber Shag',
    category: 'Play Boa Series',
    gsm: '350 GSM',
    pile: '20mm - 25mm Textured Shag',
    width: '60" (152cm)',
    backing: 'High-Density Knit Backing',
    applications: 'Statement apparel, plush mascots, bespoke automotive upholstery, novelty accessories',
    moq: '300 Meters',
    description: 'Warm golden amber hue with tactile curly shag fibers. Engineered specifically for seamless pattern cutting and high mechanical durability.',
    image: 'assets/images/saffron-boa.jpg'
  },
  'slate-velvet': {
    name: 'PV Plush - Slate Charcoal Velvet',
    category: 'PV Plush Series',
    gsm: '280 GSM',
    pile: '5mm - 6mm Micro Velvet Pile',
    width: '60" - 62" (155cm)',
    backing: 'Ultra-Flex Microfiber Backing',
    applications: 'Thermal garment lining, baby blankets, orthopaedic cushions, sleepwear',
    moq: '300 Meters',
    description: 'Zero-friction Poly Velvet plush with silky smooth gliding hand-feel. Hypoallergenic, breathable, and certified skin-safe for infant garment standards.',
    image: 'assets/images/pvplush-charcoal.jpg'
  },
  'custom-mill': {
    name: 'Bespoke Mill Formulation',
    category: 'Custom Mill Specs',
    gsm: '180 to 450 GSM (Engineered on demand)',
    pile: '3mm to 35mm Customizable',
    width: '56" to 64" (Up to 165cm)',
    backing: 'Treated Fire-Retardant / Water-Repellent / Anti-Static',
    applications: 'Industrial manufacturing, global garment export, customized brand lines',
    moq: '500 Meters per custom color',
    description: 'Our Sri Lankan mill engineers bespoke specifications to match your exact tech pack, Pantone color references, and compliance benchmarks.',
    image: 'assets/images/hero-fabric.jpg'
  }
};

function initSwatchModal() {
  const modal = document.getElementById('swatch-modal');
  const closeBtn = document.getElementById('modal-close');
  const viewBtns = document.querySelectorAll('[data-view-swatch]');

  if (!modal) return;

  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const swatchId = btn.getAttribute('data-view-swatch');
      const data = swatchesData[swatchId];
      if (data) {
        populateModal(data, swatchId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function populateModal(data, swatchId) {
  document.getElementById('modal-title').textContent = data.name;
  document.getElementById('modal-category').textContent = data.category;
  document.getElementById('modal-img').src = data.image;
  document.getElementById('modal-img').alt = data.name;
  document.getElementById('modal-desc').textContent = data.description;
  document.getElementById('modal-gsm').textContent = data.gsm;
  document.getElementById('modal-pile').textContent = data.pile;
  document.getElementById('modal-width').textContent = data.width;
  document.getElementById('modal-backing').textContent = data.backing;
  document.getElementById('modal-applications').textContent = data.applications;
  document.getElementById('modal-moq').textContent = data.moq;

  // Setup Sample Button in Modal
  const requestBtn = document.getElementById('modal-request-sample');
  if (requestBtn) {
    requestBtn.onclick = () => {
      document.getElementById('swatch-modal').classList.remove('active');
      document.body.style.overflow = '';
      selectFabricInForm(data.category.includes('Boa') ? 'play-boa' : 'pv-plush');
      const notesField = document.getElementById('inquiry-notes');
      if (notesField) {
        notesField.value = `I would like to request a physical swatch sample of: ${data.name} (${data.gsm}, ${data.pile}).`;
      }
      document.getElementById('sample-request').scrollIntoView({ behavior: 'smooth' });
    };
  }
}

function selectFabricInForm(type) {
  const chkPlayBoa = document.getElementById('fabric-playboa');
  const chkPvPlush = document.getElementById('fabric-pvplush');
  if (type === 'play-boa' && chkPlayBoa) chkPlayBoa.checked = true;
  if (type === 'pv-plush' && chkPvPlush) chkPvPlush.checked = true;
}

/* ==========================================================================
   5. SAMPLE INQUIRY & WHATSAPP GENERATOR
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('sample-inquiry-form');
  const whatsappSendBtn = document.getElementById('btn-send-whatsapp');

  if (whatsappSendBtn) {
    whatsappSendBtn.addEventListener('click', () => {
      const name = document.getElementById('inquiry-name').value.trim() || 'Valued Buyer';
      const company = document.getElementById('inquiry-company').value.trim() || 'N/A';
      const country = document.getElementById('inquiry-country').value.trim() || 'International';
      const volume = document.getElementById('inquiry-volume').value;
      const notes = document.getElementById('inquiry-notes').value.trim();

      const fabrics = [];
      if (document.getElementById('fabric-playboa')?.checked) fabrics.push('Play Boa');
      if (document.getElementById('fabric-pvplush')?.checked) fabrics.push('PV Plush');
      const fabricText = fabrics.length > 0 ? fabrics.join(' & ') : 'PV Plush / Play Boa';

      const message = `Hello LoomX Mill,\n\nI would like to request fabric samples / quotation:\n- Name: ${name}\n- Company: ${company}\n- Country: ${country}\n- Fabric Interest: ${fabricText}\n- Requirement: ${volume}\n- Notes: ${notes || 'Please share your catalog and sample swatches.'}\n\nThank you!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/94773374429?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validate at least one contact method
      const email = document.getElementById('inquiry-email').value.trim();
      const phone = document.getElementById('inquiry-phone').value.trim();

      if (!email && !phone) {
        showToast('Please provide an email or phone number so we can reach you.');
        return;
      }

      showToast('✓ Sample request submitted! Our textile team will contact you within 24 hours.');
      form.reset();
    });
  }
}

/* Toast Message */
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAns = otherItem.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
}
