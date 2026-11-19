/* Loom X (Pvt) Ltd — PV Plush Pile Fabric
 * Minimalist 3-color widget & coverflow controller
 */

const WHATSAPP_NUMBER = '94773374429';
const EMAIL = 'loomxlk@gmail.com';

const PRESETS = [
  { name: 'Crimson Red',   hex: '#EB3B3B', rgb: '235, 59, 59' },
  { name: 'Honey Gold',    hex: '#E5A035', rgb: '229, 160, 53' },
  { name: 'Emerald Green', hex: '#2EB878', rgb: '46, 184, 120' },
  { name: 'Cobalt Blue',   hex: '#548AF7', rgb: '84, 138, 247' },
  { name: 'Terracotta',    hex: '#E67045', rgb: '230, 112, 69' },
  { name: 'Rosewood Pink', hex: '#DE5499', rgb: '222, 84, 153' },
  { name: 'Teal Mint',     hex: '#4EC2B0', rgb: '78, 194, 176' },
  { name: 'Soft Lavender', hex: '#9775FA', rgb: '151, 117, 250' }
];

(() => {
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const N = PRESETS.length;

  const nav = $('#nav');
  const cf = $('#cf');
  const countEl = $('#count');
  const heroColorName = $('#heroColorName');
  const stageNum = $('#stageNum');
  const stageName = $('#stageName');
  const ctaWa = $('#ctaWa');
  const colorList = $('#colorList');
  const contactColorHeading = $('#contactColorHeading');
  const fColor = $('#fColor');
  const fBuyer = $('#fBuyer');
  const fName = $('#fName');
  const fMessage = $('#fMessage');
  const formNote = $('#formNote');

  const tv = $('#tv');
  const tvSwatchCode = $('#tvSwatchCode');
  const tvNum = $('#tvNum');
  const tvTitle = $('#tvTitle');
  const tvWa = $('#tvWa');
  const tvClose = $('#tvClose');

  let pos = 0;
  let target = 0;
  let dragging = false;
  let startX = 0;
  let startPos = 0;
  let moved = 0;
  let lastIdx = -1;

  const idx = () => ((Math.round(target) % N) + N) % N;
  const waHref = colorName => {
    const msg = `Hello Loom X, I would like to ask about ${colorName} PV Plush pile fabric.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  /* ── Build 3D Carousel Swatch Cards (image-free pure CSS pile texture) ── */
  const cards = PRESETS.map((p, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'card';
    el.style.setProperty('--card-color', p.hex);
    el.setAttribute('aria-label', `${pad(i + 1)}. ${p.name} PV Plush — click to select or inspect`);
    el.innerHTML = `
      <div class="pile-texture" aria-hidden="true"></div>
      <div class="stitch-frame" aria-hidden="true"></div>
      <div class="shade" aria-hidden="true"></div>
      <span class="n">${pad(i + 1)} · PV PLUSH</span>
      <span class="pile-mark" aria-hidden="true">SAME SOFT PILE</span>
      <span class="t">${p.name}</span>
      <span class="go">Inspect swatch</span>
    `;
    cf.appendChild(el);
    return el;
  });

  /* ── Build Interactive Color Preset List & Form Select ── */
  colorList.innerHTML = PRESETS.map((p, i) => `
    <li>
      <button type="button" data-i="${i}">
        <span class="i">${pad(i + 1)}</span>
        <span class="nm">${p.name}<span class="sg" hidden>Active</span></span>
        <span class="rd">Pick color →</span>
      </button>
    </li>
  `).join('');

  const listBtns = [...colorList.querySelectorAll('button')];

  fColor.innerHTML = PRESETS.map((p, i) =>
    `<option value="${p.name}">${pad(i + 1)} · ${p.name} PV Plush</option>`
  ).join('');

  /* ── Strict 3-Color Dynamic Accent Updater (2 fixed + 1 active fabric preset) ── */
  function applyPreset(i) {
    const p = PRESETS[i];
    if (!p) return;

    const root = document.documentElement.style;
    root.setProperty('--accent', p.hex);
    root.setProperty('--accent-rgb', p.rgb);

    if (countEl) countEl.innerHTML = `<b>${pad(i + 1)}</b> / ${pad(N)}`;
    if (heroColorName) heroColorName.textContent = p.name;
    if (stageNum) stageNum.textContent = `COLOR ${pad(i + 1)} / ${pad(N)}`;
    if (stageName) stageName.textContent = p.name;
    if (contactColorHeading) contactColorHeading.textContent = p.name;

    if (ctaWa) {
      ctaWa.textContent = `Ask about ${p.name}`;
      ctaWa.href = waHref(p.name);
    }

    if (fColor && fColor.value !== p.name) {
      fColor.value = p.name;
    }

    listBtns.forEach((btn, bIdx) => {
      const active = bIdx === i;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      const tag = btn.querySelector('.sg');
      if (tag) tag.hidden = !active;
      const rd = btn.querySelector('.rd');
      if (rd) rd.textContent = active ? 'Selected ✓' : 'Pick color →';
    });

    if (tvSwatchCode) tvSwatchCode.textContent = `COLOR ${pad(i + 1)}`;
    if (tvNum) tvNum.textContent = `Color ${pad(i + 1)} of ${pad(N)}`;
    if (tvTitle) tvTitle.textContent = p.name;
    if (tvWa) tvWa.href = waHref(p.name);
  }

  /* ── 3D Curved Coverflow Math (lolawilde.com rhythm) ── */
  const cardW = () => cards[0].offsetWidth || 290;

  function layout() {
    const w = cardW();
    const step = 23 * Math.PI / 180;
    const R = (w * 1.12) / Math.sin(step);

    cards.forEach((c, i) => {
      let d = i - pos;
      d = ((d % N) + N + N / 2) % N - N / 2;
      const ad = Math.abs(d);
      const a = d * step;
      const x = R * Math.sin(a);
      const z = R * (Math.cos(a) - 1) - ad * 30;

      c.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${a}rad)`;
      c.style.opacity = ad > 3.2 ? 0 : ad > 2.4 ? (3.2 - ad) / 0.8 : 1;
      c.style.zIndex = 100 - Math.round(ad * 10);
      c.style.pointerEvents = ad > 2.8 ? 'none' : '';
      c.classList.toggle('is-center', ad < 0.5);
      c.tabIndex = ad < 0.5 ? 0 : -1;
    });

    const curIdx = idx();
    if (curIdx !== lastIdx) {
      lastIdx = curIdx;
      applyPreset(curIdx);
    }
  }

  function loop() {
    if (!dragging) {
      const diff = target - pos;
      pos += Math.abs(diff) < 0.001 ? diff : diff * 0.12;
    }
    layout();
    requestAnimationFrame(loop);
  }

  function goToIndex(i) {
    const normalized = ((i % N) + N) % N;
    target = Math.round(target) + (((normalized - idx()) % N) + N + N / 2) % N - N / 2;
  }

  /* ── Swatch Inspector Modal Controls ── */
  function openModal(i = idx()) {
    const nextIdx = ((i % N) + N) % N;
    goToIndex(nextIdx);
    applyPreset(nextIdx);
    if (!tv.classList.contains('open')) {
      tv.classList.add('open');
      document.body.classList.add('locked');
      setTimeout(() => tvClose && tvClose.focus(), 40);
    }
  }

  function closeModal() {
    tv.classList.remove('open');
    document.body.classList.remove('locked');
    cards[idx()]?.focus({ preventScroll: true });
  }

  /* ── Carousel Drag / Click / Wheel Events ── */
  cf.addEventListener('pointerdown', e => {
    dragging = true;
    moved = 0;
    startX = e.clientX;
    startPos = pos;
    cf.classList.add('dragging');
    cf.setPointerCapture(e.pointerId);
  });

  cf.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    pos = startPos - dx / (cardW() * 1.1);
  });

  const endDrag = e => {
    if (!dragging) return;
    dragging = false;
    cf.classList.remove('dragging');
    if (moved < 6) {
      const card = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card');
      if (card) {
        const i = cards.indexOf(card);
        if (card.classList.contains('is-center')) {
          openModal(i);
        } else {
          goToIndex(i);
        }
      }
      target = Math.round(target);
      return;
    }
    target = Math.round(pos);
  };

  cf.addEventListener('pointerup', endDrag);
  cf.addEventListener('pointercancel', endDrag);

  cf.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(idx());
    }
  });

  cf.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4) {
      e.preventDefault();
      clearTimeout(cf._w);
      target += e.deltaX / 360;
      cf._w = setTimeout(() => {
        target = Math.round(target);
      }, 130);
    }
  }, { passive: false });

  $('#prev')?.addEventListener('click', () => {
    target = Math.round(target) - 1;
  });

  $('#next')?.addEventListener('click', () => {
    target = Math.round(target) + 1;
  });

  /* ── Sync Preset Selections Across List, Stage & Contact Form ── */
  colorList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    goToIndex(+btn.dataset.i);
  });

  fColor?.addEventListener('change', () => {
    const found = PRESETS.findIndex(p => p.name === fColor.value);
    if (found >= 0) goToIndex(found);
  });

  $('#openStageModal')?.addEventListener('click', () => openModal(idx()));
  tvClose?.addEventListener('click', closeModal);
  $('#tvPrev')?.addEventListener('click', () => openModal(idx() - 1));
  $('#tvNext')?.addEventListener('click', () => openModal(idx() + 1));
  $('#tvGoContact')?.addEventListener('click', () => {
    closeModal();
    $('#contact')?.scrollIntoView({ behavior: 'smooth' });
  });

  tv?.addEventListener('click', e => {
    if (e.target === tv || e.target.classList.contains('tv-shade')) {
      closeModal();
    }
  });

  addEventListener('keydown', e => {
    if (tv.classList.contains('open')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') openModal(idx() + 1);
      if (e.key === 'ArrowLeft') openModal(idx() - 1);
    } else if (
      document.activeElement?.closest('#cf') ||
      (scrollY < innerHeight * 0.5 && document.activeElement === document.body)
    ) {
      if (e.key === 'ArrowRight') target = Math.round(target) + 1;
      if (e.key === 'ArrowLeft') target = Math.round(target) - 1;
    }
  });

  /* ── Buyer Shortcut Rows -> Pre-fill Contact Form ── */
  $('#buyerPicker')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-buyer]');
    if (!btn) return;
    if (fBuyer) fBuyer.value = btn.dataset.buyer;
    if (formNote) formNote.textContent = `Selected: ${btn.dataset.buyer} · ${PRESETS[idx()].name} PV Plush`;
    $('#contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => fName?.focus({ preventScroll: true }), 420);
  });

  /* ── WhatsApp & Email Enquiry Composition ── */
  function buildInquiry() {
    const color = fColor?.value || PRESETS[idx()].name;
    const buyer = fBuyer?.value || 'Fabric buyer';
    const name = fName?.value.trim();
    const msg = fMessage?.value.trim();

    const lines = [
      'Hello Loom X (Pvt) Ltd,',
      `I am interested in PV Plush pile fabric (${color}).`,
      `Buyer type: ${buyer}`
    ];
    if (name) lines.push(`Name: ${name}`);
    if (msg) lines.push(`Notes: ${msg}`);
    return { color, body: lines.join('\n') };
  }

  $('#sendWa')?.addEventListener('click', () => {
    const { color, body } = buildInquiry();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    if (formNote) formNote.textContent = `Opening WhatsApp for ${color} PV Plush...`;
    window.open(url, '_blank', 'noopener');
  });

  $('#sendEmail')?.addEventListener('click', () => {
    const { color, body } = buildInquiry();
    const subject = `PV Plush Fabric Inquiry — ${color}`;
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (formNote) formNote.textContent = `Opening email draft for ${color} PV Plush...`;
    window.location.href = url;
  });

  /* ── Nav Scroll State & Year ── */
  addEventListener('scroll', () => {
    nav?.classList.toggle('solid', scrollY > 40);
  }, { passive: true });

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  addEventListener('resize', layout);
  applyPreset(0);
  loop();
})();
