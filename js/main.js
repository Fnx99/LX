/**
 * Loom X (Pvt) Ltd — Site & Top-Down 3D Macro Yarn & Stitch Engine (v6)
 * Inspired by Blender 3D Embroidery / Yarn macro animations:
 * - Overhead top-down macro view looking straight down onto the fabric
 * - Crisp 3D twisted yarn plies, interlocking knit/tuft stitches & macro pile detail
 * - Soft rolling 3D cloth folds & dappled studio light/shadow caustics
 * - Live 3D stitching / tufting transition with whip-stitch edge, loose pulling
 *   yarn threads, and directional cast drop-shadows onto the cloth below.
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Top-Down Macro Fabric Worlds ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Yarn Pile',
      img: 'assets/images/play-boa.jpg',
      yarnType: 0.0, // Coiled bouclé yarn loops
      rimCol: [1.00, 0.90, 0.72]
    },
    {
      name: '02 — PV Plush · Dense Sheared Velvet Tuft',
      img: 'assets/images/pv-plush.jpg',
      yarnType: 1.0, // Dense velvet cut-pile & satin stitch sheen
      rimCol: [1.00, 0.80, 0.88]
    },
    {
      name: '03 — Velboa · Interlocking Knit Plush Stitches',
      img: 'assets/images/velboa.jpg',
      yarnType: 2.0, // Crisp V-shaped warp-knit plush stitches
      rimCol: [1.00, 0.86, 0.58]
    },
    {
      name: '04 — Minky / Super Soft · Embossed 3D Dimple Plush',
      img: 'assets/images/minky.jpg',
      yarnType: 3.0, // Raised 3D dimple domes & fine silky yarn
      rimCol: [0.80, 1.00, 0.86]
    },
    {
      name: '05 — Faux Fur · Long-Pile Brushed Yarn Locks',
      img: 'assets/images/faux-fur.jpg',
      yarnType: 4.0, // Flowing multi-strand long-pile yarn
      rimCol: [1.00, 0.92, 0.78]
    },
    {
      name: '06 — Polar Fleece · Woven Twill & Brushed Thermal Yarn',
      img: 'assets/images/polar-fleece.jpg',
      yarnType: 5.0, // Deep navy twill & brushed thermal yarn
      rimCol: [0.68, 0.86, 1.00]
    }
  ];

  /* ---------- Global 3D State ---------- */
  const flowState = {
    mode: 'sea',
    prevIdx: 5,       // Start with Navy Polar Fleece underneath while Play Boa stitches over it!
    fabricIdx: 0,
    morphProg: 0.35,  // Start mid-stitch so visitor immediately sees the 3D stitching wave
    warpPulse: 0.6,
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    mouseVelX: 0,
    mouseVelY: 0,
    scrollY: window.scrollY,
    scrollVel: 0
  };

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const links = $('#nav-links');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Flow Mode Switcher & Full Macro View Toggle ---------- */
  const flowPill = $('.flow-pill');
  const flowBtns = $$('.flow-pill__btn[data-flow-mode]');
  flowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.flowMode || 'sea';
      flowState.mode = mode;
      if (flowPill) flowPill.dataset.mode = mode;
      flowBtns.forEach(b => b.classList.toggle('is-active', b === btn));
    });
  });

  const pureForestBtn = $('#toggle-pure-forest');
  const heroSection = $('#forest-section');
  if (pureForestBtn && heroSection) {
    pureForestBtn.addEventListener('click', () => {
      const active = heroSection.classList.toggle('is-pure-forest');
      pureForestBtn.setAttribute('aria-pressed', String(active));
      pureForestBtn.textContent = active ? 'Show Headline' : 'Full Macro View';
    });
  }

  /* ---------- 3D Fabric-to-Fabric Stitch Controller ---------- */
  const forestPills = $$('.forest-pill');
  const currentLabel = $('#forest-current-label');
  const warpNextBtn = $('#warp-next-btn');
  const heroImgEl = $('#hero-img');

  function warpToFabric(idx, scrollToHero = false) {
    const cleanIdx = ((idx % FABRIC_WORLDS.length) + FABRIC_WORLDS.length) % FABRIC_WORLDS.length;
    if (cleanIdx !== flowState.fabricIdx) {
      flowState.prevIdx = flowState.fabricIdx;
      flowState.fabricIdx = cleanIdx;
      flowState.morphProg = 0.0;
      flowState.warpPulse = 1.0;
      if (heroImgEl) heroImgEl.src = FABRIC_WORLDS[cleanIdx].img;
    } else {
      // Re-run the 3D stitching animation for the selected fabric
      flowState.prevIdx = (cleanIdx + 5) % FABRIC_WORLDS.length;
      flowState.morphProg = 0.0;
      flowState.warpPulse = 0.9;
    }

    if (currentLabel) currentLabel.textContent = FABRIC_WORLDS[cleanIdx].name;
    forestPills.forEach((pill, i) => {
      const active = i === cleanIdx;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-selected', String(active));
    });

    if (scrollToHero && heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  forestPills.forEach(pill => {
    pill.addEventListener('click', () => {
      warpToFabric(Number(pill.dataset.fabricIdx || 0), false);
    });
  });

  if (warpNextBtn) {
    warpNextBtn.addEventListener('click', () => {
      warpToFabric(flowState.fabricIdx + 1, false);
    });
  }

  $$('[data-enter-forest]').forEach(btn => {
    btn.addEventListener('click', () => {
      warpToFabric(Number(btn.dataset.enterForest || 0), true);
    });
  });

  /* ---------- Enquiry list ---------- */
  const selected = new Set();
  const countEl = $('#enquiry-count');
  const chips = $$('#fabric-chips input');
  const cards = $$('.fabric');

  const render = () => {
    countEl.textContent = selected.size;
    countEl.classList.toggle('has-items', selected.size > 0);

    cards.forEach(card => {
      const on = selected.has(card.dataset.fabric);
      card.classList.toggle('is-added', on);
      const btn = $('.fabric__add', card);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Added' : 'Add to enquiry';
    });

    chips.forEach(chip => { chip.checked = selected.has(chip.value); });
  };

  const bump = () => {
    countEl.classList.remove('bump');
    void countEl.offsetWidth;
    countEl.classList.add('bump');
  };

  cards.forEach(card => {
    $('.fabric__add', card).addEventListener('click', () => {
      const name = card.dataset.fabric;
      selected.has(name) ? selected.delete(name) : (selected.add(name), bump());
      render();
    });
  });

  chips.forEach(chip => {
    chip.addEventListener('change', () => {
      chip.checked ? selected.add(chip.value) : selected.delete(chip.value);
      render();
    });
  });

  $('#enquiry-btn').addEventListener('click', () => {
    $('#contact').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Enquiry form ---------- */
  const form = $('#enquiry-form');
  const errorEl = $('#enquiry-error');
  let channel = 'whatsapp';

  $$('button[type="submit"]', form).forEach(btn => {
    btn.addEventListener('click', () => { channel = btn.dataset.channel; });
  });

  const showError = (msg, field) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (field) {
      field.closest('.field')?.classList.add('has-error');
      field.focus();
    }
  };

  form.addEventListener('input', () => {
    errorEl.hidden = true;
    $$('.has-error', form).forEach(el => el.classList.remove('has-error'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const f = form.elements;
    const name = f.namedItem('name').value.trim();
    const business = f.namedItem('business').value.trim();
    const type = f.namedItem('type').value;
    const qty = f.namedItem('quantity').value.trim();
    const msg = f.namedItem('message').value.trim();
    const fabrics = chips.filter(c => c.checked).map(c => c.value);

    if (!name) return showError('Please add your name.', f.namedItem('name'));
    if (!fabrics.length && !msg) {
      return showError('Please choose at least one fabric or tell us what you need.', f.namedItem('message'));
    }

    const details = [`Name: ${name}`];
    if (business) details.push(`Business: ${business}`);
    if (type) details.push(`Business type: ${type}`);
    if (fabrics.length) details.push(`Fabrics: ${fabrics.join(', ')}`);
    if (qty) details.push(`Approx. quantity: ${qty}`);
    if (msg) details.push(`Details: ${msg}`);

    const text = [
      'Hello Loom X,',
      '',
      "I'd like to enquire about your fabrics.",
      '',
      ...details,
      '',
      'Please let me know colours, availability and pricing. Thank you.'
    ].join('\n');

    if (channel === 'email') {
      const subject = `Fabric enquiry${business ? ' — ' + business : ''}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    $$('.fabric-grid, .customer-grid, .steps, .hero__content').forEach(group => {
      $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', `${(i % 3) * 0.09}s`));
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(el => io.observe(el));
  }

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  if (reduce) return;

  /* ==========================================================================
     1. POINTER & SCROLL TRACKER
     ========================================================================== */
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / Math.max(1, window.innerWidth);
    const ny = e.clientY / Math.max(1, window.innerHeight);
    flowState.mouseVelX += (nx - flowState.targetMouseX) * 0.6;
    flowState.mouseVelY += (ny - flowState.targetMouseY) * 0.6;
    flowState.targetMouseX = nx;
    flowState.targetMouseY = ny;
  }, { passive: true });

  /* ==========================================================================
     2. WEBGL TOP-DOWN 3D MACRO YARN, STITCH & RIPPLING CLOTH ENGINE (#hero-canvas)
        - Pure overhead top-down view looking directly at the fabric from above
        - Renders 3D twisted yarn plies, interlocking knit/embroidery stitches,
          real macro fabric photography, rolling 3D cloth ripples, and dappled
          studio light/shadow caustics
        - Features a live Blender-style 3D stitching frontier with raised bevel,
          whip-stitched border, loose pulling yarn threads, and cast drop-shadows!
     ========================================================================== */
  function initTopDownYarnWebGL() {
    const canvas = $('#hero-canvas');
    if (!canvas) return null;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    if (!gl) return null;

    const vsSource = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        vUv.y = 1.0 - vUv.y;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMorph;     // 0..1 stitching progress across the fabric
      uniform float uTime;
      uniform float uAspect;
      uniform vec2 uMouse;
      uniform float uMode;      // 0 = soft ripple, 1 = breeze wave
      uniform float uYarnA;
      uniform float uYarnB;
      uniform vec3 uRimCol;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Macro 3D cloth fold height from above (soft billowing waves + cursor touch press)
      float clothFoldHeight(vec2 p, float t) {
        float w1 = sin(p.x * 3.2 + p.y * 2.4 - t * 0.85) * 0.45;
        float w2 = cos(p.x * 2.1 - p.y * 3.6 + t * 0.65) * 0.35;
        float w3 = sin((p.x + p.y) * 5.2 - t * 1.1) * 0.15;

        // Cursor finger-press ripple from above
        vec2 m = vec2(uMouse.x * uAspect, uMouse.y);
        float d2 = dot(p - m, p - m);
        float press = -exp(-d2 * 14.0) * 0.35 + sin(sqrt(d2) * 24.0 - t * 4.0) * exp(-d2 * 8.0) * 0.08;

        return w1 + w2 + w3 + press;
      }

      // Procedural 3D twisted yarn & stitch micro-relief seen from directly above
      // Recreates the crisp 3D cylindrical thread plies & woven/knitted stitch structure of Blender 5.0
      float yarnMicroHeight(vec2 p, float yarnType) {
        if (yarnType < 0.5) {
          // 01 Play Boa: High-density curled bouclé yarn loops with 2-ply thread twist (no liquid blobs!)
          vec2 q = p * 74.0;
          float loopU = q.x + sin(q.y * 0.65) * 1.4;
          float loopV = q.y + cos(q.x * 0.65) * 1.4;
          float strand = 0.5 + 0.5 * cos(loopU * 3.14159);
          float plyTwist = 0.5 + 0.5 * sin((loopU * 0.7 + loopV * 1.3) * 6.28318);
          return sqrt(max(0.05, strand)) * (0.72 + 0.28 * plyTwist);
        } else if (yarnType < 1.5) {
          // 02 PV Plush: Parallel diagonal satin-stitch 3D yarn cylinders with 2-ply twist (like EUsyXIrk5KE!)
          vec2 q = p * 88.0;
          float across = q.x * 0.45 + q.y * 0.89;
          float along  = q.x * 0.89 - q.y * 0.45;
          // Rounded cylindrical yarn profile across each thread
          float f = fract(across) - 0.5;
          float cyl = sqrt(max(0.02, 1.0 - 4.0 * f * f));
          // Diagonal 2-ply twist ridges along each yarn cylinder + stitch turn indentations
          float ply = 0.5 + 0.5 * sin(along * 8.5 + across * 12.566);
          float stitchTurn = smoothstep(0.0, 0.14, abs(fract(along * 0.08) - 0.5));
          return cyl * (0.74 + 0.26 * ply) * (0.75 + 0.25 * stitchTurn);
        } else if (yarnType < 2.5) {
          // 03 Velboa: Crisp interlocking V-shaped warp-knit stitches from above
          vec2 q = p * vec2(72.0, 84.0);
          float vLeg = abs(fract(q.x) - 0.5) * 1.35;
          float f = fract(q.x * 2.0) - 0.5;
          float cyl = sqrt(max(0.02, 1.0 - 4.0 * f * f));
          float loopRow = 0.5 + 0.5 * cos((q.y + vLeg) * 6.28318);
          return cyl * (0.68 + 0.32 * loopRow);
        } else if (yarnType < 3.5) {
          // 04 Minky: Top-down 3D raised circular Minky dimple domes + fine woven micro-yarn
          vec2 mp = p * 9.0;
          mp.x += mod(floor(mp.y), 2.0) * 0.5;
          vec2 gv = fract(mp) - 0.5;
          float r = length(gv);
          float dome = smoothstep(0.38, 0.08, r) * sqrt(max(0.0, 1.0 - min(1.0, (r / 0.38) * (r / 0.38))));
          vec2 kq = p * 92.0;
          float fineYarn = (0.5 + 0.5 * cos(kq.x * 6.283)) * (0.5 + 0.5 * cos(kq.y * 6.283));
          return dome * 0.72 + fineYarn * 0.28;
        } else if (yarnType < 4.5) {
          // 05 Faux Fur: Fine, high-density brushed multi-filament yarn strands
          float wave = sin(p.x * 5.0 + p.y * 3.5) * 0.12;
          vec2 fq = vec2((p.x + wave) * 105.0, p.y * 24.0);
          float f = fract(fq.x) - 0.5;
          float cyl = sqrt(max(0.02, 1.0 - 4.0 * f * f));
          float lenVar = 0.5 + 0.5 * sin(fq.y * 3.14159 + floor(fq.x) * 1.7);
          return cyl * (0.70 + 0.30 * lenVar);
        } else {
          // 06 Polar Fleece: Crisp woven twill warp/weft yarn grid (identical to the blue cloth in EUsyXIrk5KE!)
          vec2 tq = p * 94.0;
          float twill = 0.5 + 0.5 * cos((tq.x + tq.y * 0.5) * 6.28318);
          float weft  = 0.5 + 0.5 * cos((tq.y - tq.x * 0.5) * 6.28318);
          return (twill * 0.64 + weft * 0.36);
        }
      }

      // Compute 3D shaded fabric + yarn layer from above (matte fibrous textile shading, zero wet plastic sheen)
      vec3 shadeTopDownFabric(sampler2D tex, vec2 uv, vec2 metricP, float yarnType, vec3 clothNorm, float foldH, float dappled) {
        // Gentle overhead cloth drape offset
        vec2 drapedUv = clamp(uv + clothNorm.xy * 0.008, 0.02, 0.98);
        vec3 baseCol = texture2D(tex, drapedUv).rgb;

        // Crisp 3D cylindrical yarn normal + subtle macro photo fiber normal
        float eps = 0.0014;
        float hC = yarnMicroHeight(metricP, yarnType);
        float hX = yarnMicroHeight(metricP + vec2(eps, 0.0), yarnType) - hC;
        float hY = yarnMicroHeight(metricP + vec2(0.0, eps), yarnType) - hC;

        float tC = dot(baseCol, vec3(0.333));
        float tX = dot(texture2D(tex, clamp(drapedUv + vec2(0.003, 0.0), 0.02, 0.98)).rgb, vec3(0.333)) - tC;
        float tY = dot(texture2D(tex, clamp(drapedUv + vec2(0.0, 0.003), 0.02, 0.98)).rgb, vec3(0.333)) - tC;

        vec3 microNorm = normalize(vec3(
          clothNorm.x - hX * 0.85 - tX * 1.1,
          clothNorm.y - hY * 0.85 - tY * 1.1,
          1.0
        ));

        // Top-left studio key light + soft Oren-Nayar matte yarn diffusion
        vec3 lightDir = normalize(vec3(-0.52, -0.55, 0.65));
        float diff = max(0.0, dot(microNorm, lightDir));
        float wrapDiff = max(0.0, (dot(microNorm, lightDir) + 0.35) / 1.35);
        float threadAO = mix(0.68, 1.12, hC);

        // Dappled sunlight & cloth fold shadow (like the diagonal studio light in EUsyXIrk5KE)
        float lightMod = (0.56 + 0.54 * wrapDiff) * (0.76 + 0.34 * dappled) * threadAO;
        vec3 shaded = baseCol * lightMod;
        // Soft, wide fibrous thread sheen (matte silk/cotton, not glossy metal)
        shaded += (baseCol * 0.6 + uRimCol * 0.4) * pow(diff, 4.0) * 0.14 * hC;
        return shaded;
      }

      void main() {
        float speed = mix(0.55, 0.95, uMode);
        float t = uTime * speed;

        // Aspect-corrected top-down coordinates
        vec2 p = vec2(vUv.x * uAspect, vUv.y);

        // 1. Macro 3D cloth fold normal & dappled light from above
        float cEps = 0.018;
        float fC = clothFoldHeight(p, t);
        float fX = clothFoldHeight(p + vec2(cEps, 0.0), t) - fC;
        float fY = clothFoldHeight(p + vec2(0.0, cEps), t) - fC;
        vec3 clothNorm = normalize(vec3(-fX / cEps * 0.16, -fY / cEps * 0.16, 1.0));

        // Soft diagonal dappled light beams across the top-down cloth
        float dappled = 0.5 + 0.5 * sin(p.x * 3.8 + p.y * 2.8 - t * 0.45 + fC * 1.1);

        // Close-up overhead UV
        vec2 zoomUv = (vUv - 0.5) * 0.86 + 0.5 + vec2(sin(t * 0.22) * 0.015, cos(t * 0.18) * 0.015);

        // 2. Shade Fabric A (base cloth underneath) and Fabric B (stitched 3D yarn layer on top)
        vec3 colA = shadeTopDownFabric(uTexA, zoomUv, p, uYarnA, clothNorm, fC, dappled);
        vec3 colB = shadeTopDownFabric(uTexB, zoomUv, p, uYarnB, clothNorm, fC, dappled);

        // 3. Blender-style 3D Embroidery / Tufting Stitch Wave across the cloth
        if (uMorph < 0.995) {
          float stitchCoord = (vUv.x * 0.80 + vUv.y * 0.20);
          float frontier = uMorph * 1.28 - 0.10;

          // Stepped embroidery row contour + fine rounded stitch piping
          float rowId = floor(p.y * 18.0);
          float rowStep = (hash21(vec2(rowId, 3.7)) - 0.5) * 0.032;
          float fineStitch = p.y * 90.0 + p.x * 18.0;
          float bead = (0.5 + 0.5 * cos(fineStitch * 6.28318)) * 0.0025;
          float signedDist = (frontier + rowStep + bead) - stitchCoord;

          // Raised embroidered patch mask
          float patchMask = smoothstep(-0.002, 0.003, signedDist);

          // 3D Whip-Stitched Border with dark needle-puncture holes along the edge (like EUsyXIrk5KE!)
          float borderBand = smoothstep(0.016, 0.002, abs(signedDist - 0.006));
          float whipCord = 0.5 + 0.5 * cos(fineStitch * 6.28318);
          float needleHole = smoothstep(0.004, 0.001, abs(signedDist - 0.013)) * step(0.45, whipCord);

          // Delicate cylindrical loose yarn threads pulling into the active stitch edge
          float aheadDist = -signedDist;
          float threadSlot = p.y * 65.0;
          float slotId = floor(threadSlot);
          float slotSeed = hash21(vec2(slotId, 9.1));
          float threadLen = 0.014 + 0.032 * slotSeed;
          float curveY = sin(aheadDist * 140.0 + slotSeed * 6.28) * 0.18;
          float threadCyl = smoothstep(0.28, 0.06, abs(fract(threadSlot + curveY) - 0.5));
          float looseThreads = step(0.52, slotSeed)
            * smoothstep(0.0, 0.002, aheadDist)
            * smoothstep(threadLen, threadLen * 0.15, aheadDist)
            * threadCyl;

          // Crisp 3D Drop Shadow cast onto Fabric A below by the raised patch & loose yarn threads
          float shadowDist = (frontier + rowStep) - (stitchCoord - 0.014);
          float patchShadow = smoothstep(-0.014, 0.008, shadowDist) * (1.0 - patchMask);
          float threadShadow = step(0.52, slotSeed)
            * smoothstep(0.0, 0.003, aheadDist - 0.006)
            * smoothstep(threadLen + 0.006, threadLen * 0.15, aheadDist - 0.006)
            * smoothstep(0.34, 0.05, abs(fract((threadSlot - 0.38) + curveY) - 0.5))
            * (1.0 - patchMask);

          colA *= (1.0 - 0.55 * max(patchShadow, threadShadow * 0.9));

          // 3D beveled whip-stitch border & needle holes on Fabric B
          vec3 whipCol = mix(colB * 1.12, uRimCol, 0.25);
          colB = mix(colB, whipCol * (0.72 + 0.42 * whipCord), borderBand * 0.88);
          colB *= (1.0 - 0.62 * needleHole);

          vec3 finalCol = mix(colA, colB, patchMask);
          finalCol = mix(finalCol, whipCol * 1.05, looseThreads);
          colB = finalCol;
        }

        // Soft studio contrast envelope on the left so white hero headline stays crisp
        float leftReadability = smoothstep(0.0, 0.62, vUv.x);
        vec3 outCol = colB * mix(0.56, 0.98, leftReadability);

        gl_FragColor = vec4(outCol, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    let texturesReady = 0;
    let fileProtocolBlocked = false;
    const textures = FABRIC_WORLDS.map((fw) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([160, 145, 130, 255]));

      const img = new Image();
      img.onload = () => {
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          texturesReady++;
        } catch (_) {
          fileProtocolBlocked = true;
          canvas.classList.remove('is-ready');
        }
      };
      img.src = fw.img;
      return tex;
    });

    const uLoc = {
      texA:   gl.getUniformLocation(prog, 'uTexA'),
      texB:   gl.getUniformLocation(prog, 'uTexB'),
      morph:  gl.getUniformLocation(prog, 'uMorph'),
      time:   gl.getUniformLocation(prog, 'uTime'),
      aspect: gl.getUniformLocation(prog, 'uAspect'),
      mouse:  gl.getUniformLocation(prog, 'uMouse'),
      mode:   gl.getUniformLocation(prog, 'uMode'),
      yarnA:  gl.getUniformLocation(prog, 'uYarnA'),
      yarnB:  gl.getUniformLocation(prog, 'uYarnB'),
      rimCol: gl.getUniformLocation(prog, 'uRimCol')
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const curRim = [...FABRIC_WORLDS[0].rimCol];
    let modeVal = 0;
    const lerp = (a, b, k) => a + (b - a) * k;

    return function renderTopDown(timeSec, dt) {
      if (fileProtocolBlocked || texturesReady === 0) return;
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const worldA = FABRIC_WORLDS[flowState.prevIdx] || FABRIC_WORLDS[0];
      const worldB = FABRIC_WORLDS[flowState.fabricIdx] || FABRIC_WORLDS[0];

      // Smooth 2.4-second stitching wave across the top-down fabric
      flowState.morphProg = Math.min(1.0, flowState.morphProg + dt * 0.42);
      flowState.warpPulse *= 0.93;

      curRim[0] = lerp(curRim[0], worldB.rimCol[0], 0.08);
      curRim[1] = lerp(curRim[1], worldB.rimCol[1], 0.08);
      curRim[2] = lerp(curRim[2], worldB.rimCol[2], 0.08);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      gl.useProgram(prog);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[flowState.prevIdx] || textures[0]);
      gl.uniform1i(uLoc.texA, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[flowState.fabricIdx] || textures[0]);
      gl.uniform1i(uLoc.texB, 1);

      gl.uniform1f(uLoc.morph, flowState.morphProg);
      gl.uniform1f(uLoc.time, timeSec);
      gl.uniform1f(uLoc.aspect, Math.max(0.5, canvas.width / Math.max(1, canvas.height)));
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform1f(uLoc.yarnA, worldA.yarnType);
      gl.uniform1f(uLoc.yarnB, worldB.yarnType);
      gl.uniform3fv(uLoc.rimCol, curRim);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  /* ==========================================================================
     3. 3D BUOYANCY, SCROLL-FLIGHT INERTIA & MAGNETIC 3D CARD TILT
     ========================================================================== */
  function initSpatial3DCards() {
    const heroContent = $('.hero__content');
    const floatItems = [
      ...$$('.fabric').map((el, i) => ({ el, kind: 'fabric', phase: i * 0.95, ampY: 9, ampR: 1.8 })),
      ...$$('.customer').map((el, i) => ({ el, kind: 'customer', phase: i * 1.2 + 0.5, ampY: 7, ampR: 1.4 })),
      ...$$('.about__media').map((el) => ({ el, kind: 'media', phase: 0.7, ampY: 10, ampR: 2.0 })),
      ...$$('.enquiry').map((el) => ({ el, kind: 'enquiry', phase: 1.4, ampY: 7, ampR: 1.1 }))
    ].map(item => ({
      ...item,
      hovered: false,
      targetRx: 0,
      targetRy: 0,
      targetTz: 0,
      curRx: 0,
      curRy: 0,
      curTz: 0,
      gx: 50,
      gy: 30
    }));

    floatItems.forEach(item => {
      const { el } = item;
      el.addEventListener('pointerenter', () => {
        item.hovered = true;
        el.classList.add('is-hovered');
        if (item.kind === 'fabric' && el.dataset.fabricIndex !== undefined) {
          warpToFabric(Number(el.dataset.fabricIndex), false);
        }
      });

      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const maxTilt = item.kind === 'fabric' ? 11 : 6;

        item.targetRy = (px - 0.5) * (maxTilt * 2);
        item.targetRx = (0.5 - py) * (maxTilt * 2);
        item.targetTz = item.kind === 'fabric' ? 22 : 12;
        item.gx = px * 100;
        item.gy = py * 100;

        el.style.setProperty('--gx', `${item.gx.toFixed(1)}%`);
        el.style.setProperty('--gy', `${item.gy.toFixed(1)}%`);
        el.style.setProperty('--go', '0.75');
        el.style.setProperty('--ix', `${((0.5 - px) * 14).toFixed(1)}px`);
        el.style.setProperty('--iy', `${((0.5 - py) * 14).toFixed(1)}px`);
      });

      el.addEventListener('pointerleave', () => {
        item.hovered = false;
        item.targetRx = 0;
        item.targetRy = 0;
        item.targetTz = 0;
        el.classList.remove('is-hovered');
        el.style.setProperty('--go', '0.35');
        el.style.setProperty('--ix', '0px');
        el.style.setProperty('--iy', '0px');
      });
    });

    return function updateSpatial3D(t) {
      const isSky = flowState.mode === 'sky';
      const freq = isSky ? 1.35 : 0.95;

      if (heroContent && flowState.scrollY < window.innerHeight) {
        const hx = (flowState.mouseX - 0.5) * -12;
        const hy = (flowState.mouseY - 0.5) * -10 + Math.sin(t * freq) * 4;
        const hrx = (0.5 - flowState.mouseY) * 3.0 + Math.cos(t * 0.8) * 0.7;
        const hry = (flowState.mouseX - 0.5) * 4.0 + Math.sin(t * 0.7) * 0.9;
        heroContent.style.setProperty('--hx', `${hx.toFixed(2)}px`);
        heroContent.style.setProperty('--hy', `${hy.toFixed(2)}px`);
        heroContent.style.setProperty('--hrx', `${hrx.toFixed(2)}deg`);
        heroContent.style.setProperty('--hry', `${hry.toFixed(2)}deg`);

        if (heroImgEl) {
          const ix = (flowState.mouseX - 0.5) * 22 + Math.sin(t * freq * 0.8) * 8;
          const iy = (flowState.mouseY - 0.5) * 16 + Math.cos(t * freq * 0.7) * 6;
          heroImgEl.style.transform = `scale(1.12) translate3d(${ix.toFixed(1)}px, ${iy.toFixed(1)}px, 0)`;
        }
      }

      const scrollPitch = Math.max(-7, Math.min(7, flowState.scrollVel * 0.18));
      const scrollLift = Math.max(-18, Math.min(18, -flowState.scrollVel * 0.35));

      for (let i = 0; i < floatItems.length; i++) {
        const it = floatItems[i];
        const waveY = Math.sin(t * freq + it.phase) * it.ampY + scrollLift;
        const waveRx = Math.cos(t * (freq * 0.85) + it.phase) * it.ampR;
        const waveRy = Math.sin(t * (freq * 0.75) + it.phase * 1.3) * it.ampR;

        const goalRx = it.hovered ? it.targetRx : (waveRx + scrollPitch);
        const goalRy = it.hovered ? it.targetRy : waveRy;
        const goalTz = it.hovered ? it.targetTz : (Math.sin(t * freq + it.phase) * 6);

        it.curRx += (goalRx - it.curRx) * 0.1;
        it.curRy += (goalRy - it.curRy) * 0.1;
        it.curTz += (goalTz - it.curTz) * 0.1;

        it.el.style.setProperty('--fy', `${(it.hovered ? -6 : waveY).toFixed(2)}px`);
        it.el.style.setProperty('--rx', `${it.curRx.toFixed(2)}deg`);
        it.el.style.setProperty('--ry', `${it.curRy.toFixed(2)}deg`);
        it.el.style.setProperty('--tz', `${it.curTz.toFixed(2)}px`);
      }
    };
  }

  /* ==========================================================================
     4. UNIFIED 60FPS ANIMATION LOOP
     ========================================================================== */
  const renderTopDown = initTopDownYarnWebGL();
  const updateSpatial3D = initSpatial3DCards();

  let lastTime = performance.now() * 0.001;
  function tick(nowMs) {
    const t = nowMs * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, t - lastTime));
    lastTime = t;

    flowState.mouseX += (flowState.targetMouseX - flowState.mouseX) * 0.08;
    flowState.mouseY += (flowState.targetMouseY - flowState.mouseY) * 0.08;
    flowState.mouseVelX *= 0.9;
    flowState.mouseVelY *= 0.9;

    const currentScroll = window.scrollY;
    const rawDelta = currentScroll - flowState.scrollY;
    flowState.scrollY = currentScroll;
    flowState.scrollVel += (rawDelta - flowState.scrollVel) * 0.15;
    flowState.scrollVel *= 0.92;

    if (renderTopDown) renderTopDown(t, dt);
    if (updateSpatial3D) updateSpatial3D(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
