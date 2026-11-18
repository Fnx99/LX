/**
 * Loom X (Pvt) Ltd — Site & 3D Microscopic "Ant-Eye Fiber Forest" Engine
 * - Nav state on scroll + mobile menu
 * - Enquiry list: "Add to enquiry" on fabric cards syncs with the form chips
 * - Enquiry form composes a real WhatsApp / email message (no fake submit)
 * - WebGL 3D Microscopic Pile-Fabric Forest (Ant-Eye 0.5mm View) with magical
 *   fabric-to-fabric warp flight & real-time 3D DNA morphing across all 6 fabrics
 * - Full-viewport 3D Floating Fiber & Current Field (#ambient-canvas)
 * - 60fps 3D Buoyant Float, Scroll-Flight Inertia & Magnetic 3D Card Tilt
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Fabric Microscopic 3D Forest Presets ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Forest',
      // Towering helical curly loops in warm cream/ivory
      height: 3.15,
      radius: 0.135,
      curlAmp: 0.50,
      curlTurns: 12.0,
      arch: 0.22,
      domeAmp: 0.05,
      swayAmp: 0.34,
      rootCol: [0.16, 0.13, 0.10],
      midCol:  [0.78, 0.71, 0.60],
      tipCol:  [0.98, 0.95, 0.88],
      rimCol:  [1.00, 0.82, 0.58],
      skyCol:  [0.07, 0.06, 0.05]
    },
    {
      name: '02 — PV Plush · Velvet Pillar Cathedral',
      // Tall, dense, straight velvet columns in dusty rose with silk sheen
      height: 3.55,
      radius: 0.102,
      curlAmp: 0.045,
      curlTurns: 2.2,
      arch: 0.16,
      domeAmp: 0.0,
      swayAmp: 0.42,
      rootCol: [0.17, 0.07, 0.10],
      midCol:  [0.72, 0.43, 0.49],
      tipCol:  [0.96, 0.76, 0.81],
      rimCol:  [1.00, 0.85, 0.90],
      skyCol:  [0.08, 0.04, 0.06]
    },
    {
      name: '03 — Velboa · Low Sculpted Plush Meadow',
      // Compact, stout, smooth honey-caramel plush stalks
      height: 2.05,
      radius: 0.155,
      curlAmp: 0.035,
      curlTurns: 1.5,
      arch: 0.08,
      domeAmp: 0.0,
      swayAmp: 0.22,
      rootCol: [0.19, 0.11, 0.04],
      midCol:  [0.72, 0.48, 0.23],
      tipCol:  [0.95, 0.75, 0.48],
      rimCol:  [1.00, 0.88, 0.64],
      skyCol:  [0.08, 0.05, 0.03]
    },
    {
      name: '04 — Minky / Super Soft · Silky Dimple-Dome Valley',
      // Rolling 3D raised Minky dimple hills with ultra-fine sage micro-filaments
      height: 2.35,
      radius: 0.086,
      curlAmp: 0.07,
      curlTurns: 3.2,
      arch: 0.28,
      domeAmp: 0.88,
      swayAmp: 0.38,
      rootCol: [0.07, 0.13, 0.09],
      midCol:  [0.42, 0.56, 0.45],
      tipCol:  [0.76, 0.88, 0.78],
      rimCol:  [0.88, 0.98, 0.90],
      skyCol:  [0.04, 0.07, 0.05]
    },
    {
      name: '05 — Faux Fur · Towering Long-Pile Redwood Jungle',
      // Colossal, sweeping long-pile fur shafts arching overhead
      height: 4.45,
      radius: 0.095,
      curlAmp: 0.11,
      curlTurns: 2.5,
      arch: 1.15,
      domeAmp: 0.0,
      swayAmp: 0.62,
      rootCol: [0.15, 0.11, 0.08],
      midCol:  [0.68, 0.57, 0.45],
      tipCol:  [0.97, 0.91, 0.83],
      rimCol:  [1.00, 0.95, 0.85],
      skyCol:  [0.07, 0.05, 0.04]
    },
    {
      name: '06 — Polar Fleece · Brushed Thermal Cloud Labyrinth',
      // Interwoven brushed navy & ice-blue thermal loops
      height: 2.80,
      radius: 0.132,
      curlAmp: 0.44,
      curlTurns: 7.5,
      arch: 0.68,
      domeAmp: 0.25,
      swayAmp: 0.36,
      rootCol: [0.04, 0.08, 0.16],
      midCol:  [0.16, 0.30, 0.54],
      tipCol:  [0.50, 0.70, 0.95],
      rimCol:  [0.72, 0.86, 1.00],
      skyCol:  [0.03, 0.05, 0.09]
    }
  ];

  /* ---------- Global 3D Flow & Forest State ---------- */
  const flowState = {
    mode: 'sea', // 'sea' | 'sky'
    fabricIdx: 0,
    warpPulse: 0, // Surges to 1.0 when warping between fabrics
    camZ: 0,
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

  /* ---------- Flow Mode Switcher & Pure Forest Toggle ---------- */
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
      pureForestBtn.textContent = active ? 'Show Headline' : 'Ant-Eye Full View';
    });
  }

  /* ---------- Magic Fabric-to-Fabric Warp Controller ---------- */
  const forestPills = $$('.forest-pill');
  const currentLabel = $('#forest-current-label');
  const warpNextBtn = $('#warp-next-btn');

  function warpToFabric(idx, scrollToHero = false) {
    const cleanIdx = ((idx % FABRIC_WORLDS.length) + FABRIC_WORLDS.length) % FABRIC_WORLDS.length;
    if (cleanIdx !== flowState.fabricIdx) {
      flowState.WarpFrom = flowState.fabricIdx;
      flowState.fabricIdx = cleanIdx;
      flowState.warpPulse = 1.0; // Triggers hyper-flight through the fiber forest
    } else {
      flowState.warpPulse = Math.max(flowState.warpPulse, 0.7);
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
      const idx = Number(pill.dataset.fabricIdx || 0);
      warpToFabric(idx, false);
    });
  });

  if (warpNextBtn) {
    warpNextBtn.addEventListener('click', () => {
      warpToFabric(flowState.fabricIdx + 1, false);
    });
  }

  $$('[data-enter-forest]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.enterForest || 0);
      warpToFabric(idx, true);
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
     2. WEBGL 3D ANT-EYE MICROSCOPIC FIBER FOREST (#hero-canvas)
        Renders 520 towering 3D multi-segment pile fibers rising from a woven
        knit floor. Morphs in real time between all 6 fabric structures!
     ========================================================================== */
  function initMicroForestWebGL() {
    const canvas = $('#hero-canvas');
    if (!canvas) return null;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    if (!gl) {
      // 3D Perspective Canvas-2D Fallback when WebGL is unavailable (e.g. headless --disable-gpu)
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return null;
      const COUNT2D = 160;
      let sRng = 42;
      const sRand = () => ((sRng = (sRng * 16807) % 2147483647) - 1) / 2147483646;
      const strands = Array.from({ length: COUNT2D }, (_, i) => ({
        rx: ((i % 20) / 20 - 0.44 + (sRand() - 0.5) * 0.04) * 16.5,
        rz: (Math.floor(i / 20) + sRand()) * 2.2,
        seed: sRand()
      }));
      const cur2d = JSON.parse(JSON.stringify(FABRIC_WORLDS[0]));
      const lerp = (a, b, k) => a + (b - a) * k;
      const rgb = (c, a = 1) => `rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},${a})`;

      return function renderForest2D(timeSec, dt) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

        const target = FABRIC_WORLDS[flowState.fabricIdx] || FABRIC_WORLDS[0];
        cur2d.height = lerp(cur2d.height, target.height, 0.08);
        cur2d.radius = lerp(cur2d.radius, target.radius, 0.08);
        cur2d.curlAmp = lerp(cur2d.curlAmp, target.curlAmp, 0.08);
        cur2d.arch = lerp(cur2d.arch, target.arch, 0.08);
        cur2d.swayAmp = lerp(cur2d.swayAmp, target.swayAmp, 0.08);
        for (let k = 0; k < 3; k++) {
          cur2d.rootCol[k] = lerp(cur2d.rootCol[k], target.rootCol[k], 0.08);
          cur2d.midCol[k]  = lerp(cur2d.midCol[k],  target.midCol[k],  0.08);
          cur2d.tipCol[k]  = lerp(cur2d.tipCol[k],  target.tipCol[k],  0.08);
          cur2d.skyCol[k]  = lerp(cur2d.skyCol[k],  target.skyCol[k],  0.08);
        }

        flowState.camZ = (flowState.camZ + (1.0 + flowState.warpPulse * 12) * dt) % 18.0;
        flowState.warpPulse *= 0.93;

        ctx2d.fillStyle = rgb(cur2d.skyCol, 0.85);
        ctx2d.fillRect(0, 0, w, h);

        const fov = h * 0.82;
        const cx = w * 0.54;
        const cy = h * 0.62;

        // Sort back-to-front by wrapped Z
        const ordered = strands.map(st => {
          let zRel = (st.rz - flowState.camZ) % 18.0;
          if (zRel < 0) zRel += 18.0;
          return { st, wz: zRel + 1.3 };
        }).sort((a, b) => b.wz - a.wz);

        for (let i = 0; i < ordered.length; i++) {
          const { st, wz } = ordered[i];
          const scale0 = fov / wz;
          const x0 = cx + st.rx * scale0;
          const y0 = cy + (1.15) * scale0;

          const sway = Math.sin(timeSec * 1.2 + st.rx * 0.4 + st.seed * 6.2) * cur2d.swayAmp;
          const curl = Math.cos(st.seed * 12.5 + timeSec) * cur2d.curlAmp;
          const xMid = cx + (st.rx + sway * 0.5 + curl) * scale0;
          const yMid = cy + (1.15 - cur2d.height * 0.55) * scale0;
          const xTip = cx + (st.rx + sway + cur2d.arch * Math.cos(st.seed * 6.2) - curl * 0.6) * scale0;
          const yTip = cy + (1.15 - cur2d.height) * scale0;

          const alpha = Math.max(0.08, Math.min(0.95, 1.0 - (wz - 1.3) / 17.5));
          const grad = ctx2d.createLinearGradient(x0, y0, xTip, yTip);
          grad.addColorStop(0, rgb(cur2d.rootCol, alpha));
          grad.addColorStop(0.5, rgb(cur2d.midCol, alpha));
          grad.addColorStop(1, rgb(cur2d.tipCol, alpha));

          ctx2d.strokeStyle = grad;
          ctx2d.lineWidth = Math.max(1.5, (cur2d.radius * 2.1) * scale0);
          ctx2d.lineCap = 'round';
          ctx2d.beginPath();
          ctx2d.moveTo(x0, y0);
          ctx2d.quadraticCurveTo(xMid, yMid, xTip, yTip);
          ctx2d.stroke();
        }
      };
    }

    const vsSource = `
      attribute vec4 aFiber; // x: rootX, y: rootZ, z: s (0..1), w: side (-1..1)
      attribute float aSeed;

      uniform float uTime;
      uniform float uCamZ;
      uniform float uAspect;
      uniform vec2 uMouse;
      uniform float uMode;      // 0 = sea drift, 1 = sky breeze
      uniform float uWarp;      // 0..1 warp speed pulse

      // Morphable 3D Fiber DNA uniforms
      uniform float uHeight;
      uniform float uRadius;
      uniform float uCurlAmp;
      uniform float uCurlTurns;
      uniform float uArch;
      uniform float uDomeAmp;
      uniform float uSwayAmp;

      varying float vS;
      varying float vSide;
      varying float vDepth;
      varying float vSeed;
      varying float vSlope;

      void main() {
        float rootX = aFiber.x;
        float rawZ  = aFiber.y;
        float s     = aFiber.z;
        float side  = aFiber.w;

        // Infinite wrapping Z corridor ahead of the ant camera (depth 1.2 to 21.2)
        float spanZ = 20.0;
        float zRel = mod(rawZ - uCamZ, spanZ);
        if (zRel < 0.0) zRel += spanZ;
        float worldZ = zRel + 1.15;

        // Raised Minky dimple-dome hills on the woven knit floor
        float dome = sin(rootX * 0.75) * cos((rawZ) * 0.75) * uDomeAmp;

        // Sea / Sky wind wave travelling through the giant fiber canopy
        float freq = mix(0.95, 1.55, uMode);
        float windPhase = uTime * freq + rootX * 0.38 + rawZ * 0.28 + aSeed * 6.2831;
        float bendPow = pow(s, 1.45);
        float swayX = sin(windPhase) * uSwayAmp * bendPow;
        float swayZ = cos(windPhase * 0.85) * (uSwayAmp * 0.6) * bendPow;

        // Helical 3D bouclé curl (Play Boa / Polar Fleece loops)
        float curlAngle = s * uCurlTurns + aSeed * 12.566 + uTime * 0.6;
        float curlEnv = sin(s * 3.14159) * (0.35 + 0.65 * s);
        float curlX = cos(curlAngle) * uCurlAmp * curlEnv;
        float curlZ = sin(curlAngle) * uCurlAmp * curlEnv;
        float curlY = sin(curlAngle * 0.5) * (uCurlAmp * 0.28) * curlEnv;

        // Long-pile sweeping fur arch (Faux Fur)
        float archX = cos(aSeed * 6.283 + 0.6) * uArch * pow(s, 2.0);
        float archZ = sin(aSeed * 6.283 + 0.6) * (uArch * 0.5) * pow(s, 2.0);

        // Ant-camera look & interactive cursor wind-parting sphere
        float lookX = (uMouse.x - 0.5) * 3.2;
        float lookY = (0.5 - uMouse.y) * 1.4;

        float wx = rootX + swayX + curlX + archX;
        float wz = worldZ + swayZ + curlZ + archZ;

        // Cursor parts the nearby giant fibers like an ant brushing through grass
        float cursorWorldX = (uMouse.x - 0.5) * 9.0;
        float dx = wx - cursorWorldX;
        float dz = wz - 5.2;
        float dist2 = dx * dx + dz * dz;
        float push = exp(-dist2 * 0.22) * bendPow * 1.35;
        wx += sign(dx + 0.001) * push;

        float wy = dome + s * uHeight + curlY - 0.18 * (swayX * swayX) * s;

        // Ant-eye camera positioned low on the knit floor (y = 1.05), looking slightly up into the canopy
        float camX = lookX * 0.85;
        float camY = 1.05 + lookY * 0.45;
        vec3 rel = vec3(wx - camX, wy - camY, wz);

        // Upward ant-eye pitch (+0.11 rad) + subtle yaw
        float pitch = 0.11 + lookY * 0.12;
        float cp = cos(pitch), sp = sin(pitch);
        vec3 viewPos = vec3(
          rel.x,
          rel.y * cp + rel.z * sp,
          rel.z * cp - rel.y * sp
        );

        // Taper fiber thickness from sturdy root to delicate tip, plus warp stretch
        float taper = mix(1.0, 0.24, s * s);
        float radius = uRadius * taper * (1.0 - 0.22 * uWarp);
        viewPos.x += side * radius;

        // Perspective projection (FOV ~62 deg, extra wide during warp jump)
        float fovScale = 1.62 - uWarp * 0.28;
        float zp = max(0.35, viewPos.z);
        gl_Position = vec4(
          (viewPos.x * fovScale) / (zp * uAspect),
          (viewPos.y * fovScale) / zp,
          clamp((zp - 0.5) / 22.0, -0.99, 0.99),
          1.0
        );

        vS = s;
        vSide = side;
        vDepth = clamp((zp - 1.1) / 18.5, 0.0, 1.0);
        vSeed = aSeed;
        vSlope = curlX * 0.9 + swayX * 0.5;
      }
    `;

    const fsSource = `
      precision highp float;
      varying float vS;
      varying float vSide;
      varying float vDepth;
      varying float vSeed;
      varying float vSlope;

      uniform vec3 uRootCol;
      uniform vec3 uMidCol;
      uniform vec3 uTipCol;
      uniform vec3 uRimCol;
      uniform vec3 uSkyCol;
      uniform float uWarp;

      void main() {
        // 3D cylindrical fiber normal across the ribbon width (-1..1)
        float nx = clamp(vSide, -0.99, 0.99);
        float nz = sqrt(max(0.01, 1.0 - nx * nx));
        vec3 normal = normalize(vec3(nx, vSlope * 0.35, nz));

        // Base color gradient from deep knit root -> plush mid-shaft -> luminous tip
        vec3 baseCol = mix(uRootCol, uMidCol, smoothstep(0.0, 0.52, vS));
        baseCol = mix(baseCol, uTipCol, smoothstep(0.45, 1.0, vS));

        // Subtle per-fiber tonal variation
        baseCol *= (0.90 + 0.18 * vSeed);

        // Key light + Kajiya-Kay style velvet/plush rim & translucent backscatter
        vec3 lightDir = normalize(vec3(0.42, 0.68, 0.59));
        float diff = max(0.0, dot(normal, lightDir));
        float rim = pow(1.0 - nz, 2.1);
        float spec = pow(max(0.0, dot(normal, normalize(vec3(-0.25, 0.55, 0.80)))), 14.0);

        // Root ambient occlusion at the knit floor
        float ao = smoothstep(0.0, 0.22, vS) * 0.78 + 0.22;

        vec3 col = baseCol * (0.38 + 0.72 * diff) * ao;
        col += uRimCol * rim * (0.42 + 0.35 * vS);
        col += uRimCol * spec * (0.28 + 0.35 * uWarp);

        // Blend into deep atmospheric forest horizon fog
        float fog = smoothstep(0.04, 0.98, vDepth);
        vec3 fogCol = uSkyCol + uRimCol * (0.04 + 0.08 * uWarp);
        col = mix(col, fogCol, fog * 0.88);

        // Soft anti-aliased edge on each 3D cylinder strand
        float alpha = smoothstep(1.0, 0.72, abs(vSide)) * (1.0 - fog * 0.65);
        gl_FragColor = vec4(col, alpha * 0.92);
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

    // Build 520 3D multi-segment fibers sorted back-to-front or depth-tested
    const FIBER_COUNT = 520;
    const SEGS = 12; // 12 segments along each 3D fiber trunk
    const FLOATS_PER_VERT = 5; // rootX, rootZ, s, side, seed
    const verts = new Float32Array(FIBER_COUNT * SEGS * 6 * FLOATS_PER_VERT);

    let ptr = 0;
    function pushVert(rx, rz, s, side, seed) {
      verts[ptr++] = rx;
      verts[ptr++] = rz;
      verts[ptr++] = s;
      verts[ptr++] = side;
      verts[ptr++] = seed;
    }

    // Pseudo-random deterministic generator for lush organic forest spacing
    let rng = 1337;
    function rand() {
      rng = (rng * 16807) % 2147483647;
      return (rng - 1) / 2147483646;
    }

    const COLS = 26;
    const ROWS = 20;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Spread fibers across X in [-8.5, +8.5], with denser framing on the right two-thirds
        const u = (c + (rand() - 0.5) * 0.82) / COLS;
        const rootX = (u - 0.44) * 17.5;
        const rootZ = (r + (rand() - 0.5) * 0.82) * (20.0 / ROWS);
        const seed = rand();

        for (let seg = 0; seg < SEGS; seg++) {
          const s0 = seg / SEGS;
          const s1 = (seg + 1) / SEGS;
          // 2 triangles per segment
          pushVert(rootX, rootZ, s0, -1, seed);
          pushVert(rootX, rootZ, s0,  1, seed);
          pushVert(rootX, rootZ, s1, -1, seed);

          pushVert(rootX, rootZ, s1, -1, seed);
          pushVert(rootX, rootZ, s0,  1, seed);
          pushVert(rootX, rootZ, s1,  1, seed);
        }
      }
    }

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aFiber = gl.getAttribLocation(prog, 'aFiber');
    const aSeed  = gl.getAttribLocation(prog, 'aSeed');
    const stride = FLOATS_PER_VERT * 4;
    gl.enableVertexAttribArray(aFiber);
    gl.vertexAttribPointer(aFiber, 4, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aSeed);
    gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, stride, 16);

    const uLoc = {
      time:      gl.getUniformLocation(prog, 'uTime'),
      camZ:      gl.getUniformLocation(prog, 'uCamZ'),
      aspect:    gl.getUniformLocation(prog, 'uAspect'),
      mouse:     gl.getUniformLocation(prog, 'uMouse'),
      mode:      gl.getUniformLocation(prog, 'uMode'),
      warp:      gl.getUniformLocation(prog, 'uWarp'),
      height:    gl.getUniformLocation(prog, 'uHeight'),
      radius:    gl.getUniformLocation(prog, 'uRadius'),
      curlAmp:   gl.getUniformLocation(prog, 'uCurlAmp'),
      curlTurns: gl.getUniformLocation(prog, 'uCurlTurns'),
      arch:      gl.getUniformLocation(prog, 'uArch'),
      domeAmp:   gl.getUniformLocation(prog, 'uDomeAmp'),
      swayAmp:   gl.getUniformLocation(prog, 'uSwayAmp'),
      rootCol:   gl.getUniformLocation(prog, 'uRootCol'),
      midCol:    gl.getUniformLocation(prog, 'uMidCol'),
      tipCol:    gl.getUniformLocation(prog, 'uTipCol'),
      rimCol:    gl.getUniformLocation(prog, 'uRimCol'),
      skyCol:    gl.getUniformLocation(prog, 'uSkyCol')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    // Current interpolated DNA state (smoothly morphs when switching fabrics)
    const cur = JSON.parse(JSON.stringify(FABRIC_WORLDS[0]));
    let modeVal = 0;
    const totalVerts = FIBER_COUNT * SEGS * 6;

    const lerp = (a, b, k) => a + (b - a) * k;
    const lerp3 = (arr, target, k) => {
      arr[0] = lerp(arr[0], target[0], k);
      arr[1] = lerp(arr[1], target[1], k);
      arr[2] = lerp(arr[2], target[2], k);
    };

    return function renderForest(timeSec, dt) {
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const target = FABRIC_WORLDS[flowState.fabricIdx] || FABRIC_WORLDS[0];
      const morphSpeed = 0.075;

      cur.height    = lerp(cur.height, target.height, morphSpeed);
      cur.radius    = lerp(cur.radius, target.radius, morphSpeed);
      cur.curlAmp   = lerp(cur.curlAmp, target.curlAmp, morphSpeed);
      cur.curlTurns = lerp(cur.curlTurns, target.curlTurns, morphSpeed);
      cur.arch      = lerp(cur.arch, target.arch, morphSpeed);
      cur.domeAmp   = lerp(cur.domeAmp, target.domeAmp, morphSpeed);
      cur.swayAmp   = lerp(cur.swayAmp, target.swayAmp, morphSpeed);

      lerp3(cur.rootCol, target.rootCol, morphSpeed);
      lerp3(cur.midCol,  target.midCol,  morphSpeed);
      lerp3(cur.tipCol,  target.tipCol,  morphSpeed);
      lerp3(cur.rimCol,  target.rimCol,  morphSpeed);
      lerp3(cur.skyCol,  target.skyCol,  morphSpeed);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      // Advance ant camera forward through the infinite 3D fiber forest
      const baseSpeed = flowState.mode === 'sky' ? 1.45 : 0.85;
      const warpSpeed = flowState.warpPulse * 14.5;
      flowState.camZ = (flowState.camZ + (baseSpeed + warpSpeed) * dt) % 20.0;
      flowState.warpPulse *= 0.93;

      gl.clearColor(cur.skyCol[0], cur.skyCol[1], cur.skyCol[2], 0.86);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);

      gl.uniform1f(uLoc.time, timeSec);
      gl.uniform1f(uLoc.camZ, flowState.camZ);
      gl.uniform1f(uLoc.aspect, Math.max(0.5, canvas.width / Math.max(1, canvas.height)));
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform1f(uLoc.warp, flowState.warpPulse);

      gl.uniform1f(uLoc.height, cur.height);
      gl.uniform1f(uLoc.radius, cur.radius);
      gl.uniform1f(uLoc.curlAmp, cur.curlAmp);
      gl.uniform1f(uLoc.curlTurns, cur.curlTurns);
      gl.uniform1f(uLoc.arch, cur.arch);
      gl.uniform1f(uLoc.domeAmp, cur.domeAmp);
      gl.uniform1f(uLoc.swayAmp, cur.swayAmp);

      gl.uniform3fv(uLoc.rootCol, cur.rootCol);
      gl.uniform3fv(uLoc.midCol,  cur.midCol);
      gl.uniform3fv(uLoc.tipCol,  cur.tipCol);
      gl.uniform3fv(uLoc.rimCol,  cur.rimCol);
      gl.uniform3fv(uLoc.skyCol,  cur.skyCol);

      gl.drawArrays(gl.TRIANGLES, 0, totalVerts);
    };
  }

  /* ==========================================================================
     3. FULL-VIEWPORT 3D FLOATING FIBER & SEA/SKY CURRENT FIELD
     ========================================================================== */
  function initAmbient3DField() {
    const canvas = $('#ambient-canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let w = 0, h = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = 42;
    const motes = Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: 0.2 + (i / COUNT) * 0.8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.7,
      phase: Math.random() * Math.PI * 2,
      len: 12 + Math.random() * 22,
      hueType: i % 3
    }));

    return function renderAmbient(t) {
      ctx.clearRect(0, 0, w, h);
      const isSky = flowState.mode === 'sky';
      const windX = (flowState.mouseX - 0.5) * (isSky ? 1.4 : 0.7);
      const scrollBoost = flowState.scrollVel * 0.32;
      const warpStreak = flowState.warpPulse * 14;

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const depth = m.z;

        const vx = isSky
          ? (0.45 + Math.sin(t * 0.7 + m.phase) * 0.35 + windX * 1.6) * depth
          : (Math.sin(t * 0.55 + m.phase) * 0.48 + windX * 0.9) * depth;

        const vy = isSky
          ? (-0.42 + Math.cos(t * 0.8 + m.phase) * 0.25) * depth - scrollBoost * depth + warpStreak * depth
          : (-0.18 + Math.sin(t * 0.65 + m.phase * 1.3) * 0.32) * depth - scrollBoost * depth * 0.7 + warpStreak * depth;

        m.x += vx;
        m.y += vy;
        m.angle += m.spin * 0.012 + (isSky ? 0.008 : 0.004) * Math.sin(t + m.phase);

        if (m.x < -40) m.x = w + 40;
        if (m.x > w + 40) m.x = -40;
        if (m.y < -40) m.y = h + 40;
        if (m.y > h + 40) m.y = -40;

        const alpha = (0.15 + depth * 0.24) * (0.75 + 0.25 * Math.sin(t * 1.4 + m.phase));
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);

        const len = (m.len + warpStreak * 2.5) * depth;
        const bow = Math.sin(t * 1.8 + m.phase) * (5.5 * depth);

        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.quadraticCurveTo(0, bow, len * 0.5, 0);

        if (m.hueType === 1) {
          ctx.strokeStyle = `rgba(255, 74, 43, ${alpha * 1.15})`;
        } else if (m.hueType === 2) {
          ctx.strokeStyle = isSky
            ? `rgba(255, 217, 207, ${alpha})`
            : `rgba(140, 210, 245, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(180, 172, 160, ${alpha})`;
        }

        ctx.lineWidth = Math.max(1, 1.9 * depth);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    };
  }

  /* ==========================================================================
     4. 3D BUOYANCY, SCROLL-FLIGHT INERTIA & MAGNETIC 3D CARD TILT
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
        // Also morph the background 3D forest when hovering a fabric card!
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
        const hx = (flowState.mouseX - 0.5) * -18;
        const hy = (flowState.mouseY - 0.5) * -14 + Math.sin(t * freq) * 6;
        const hrx = (0.5 - flowState.mouseY) * 4.5 + Math.cos(t * 0.8) * 1.2;
        const hry = (flowState.mouseX - 0.5) * 5.5 + Math.sin(t * 0.7) * 1.4;
        heroContent.style.setProperty('--hx', `${hx.toFixed(2)}px`);
        heroContent.style.setProperty('--hy', `${hy.toFixed(2)}px`);
        heroContent.style.setProperty('--hrx', `${hrx.toFixed(2)}deg`);
        heroContent.style.setProperty('--hry', `${hry.toFixed(2)}deg`);

        const heroImgEl = $('#hero-img');
        if (heroImgEl) {
          const ix = (flowState.mouseX - 0.5) * 20 + Math.sin(t * freq * 0.8) * 7;
          const iy = (flowState.mouseY - 0.5) * 14 + Math.cos(t * freq * 0.7) * 5;
          heroImgEl.style.transform = `scale(1.08) translate3d(${ix.toFixed(1)}px, ${iy.toFixed(1)}px, 0)`;
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
     5. UNIFIED 60FPS ANIMATION LOOP
     ========================================================================== */
  const renderForest = initMicroForestWebGL();
  const renderAmbient = initAmbient3DField();
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

    if (renderForest) renderForest(t, dt);
    if (renderAmbient) renderAmbient(t);
    if (updateSpatial3D) updateSpatial3D(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
