/**
 * Loom X (Pvt) Ltd — Site & 3D Microscopic "Ant-Eye Fiber Forest" Engine (v2)
 * - Glitch-free screen-space tangent-normal 3D fiber extrusion (zero ribbon kinks or Z-fighting)
 * - 1,350 slender, silky multi-toned 3D pile fibers + glowing knit root floor + 3D light motes
 * - Seamless near/far horizon growth envelope (zero Z-wrap popping)
 * - Magical fabric-to-fabric warp flight across all 6 Loom X fabrics
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Fabric Microscopic 3D Forest Presets (Rich Multi-Tone Palettes) ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Forest',
      // Delicate coiled bouclé spirals in warm ivory, champagne gold & soft rose-pearl
      height: 2.35,
      radius: 0.052,
      curlAmp: 0.22,
      curlTurns: 5.2,
      arch: 0.18,
      domeAmp: 0.08,
      swayAmp: 0.26,
      rootCol: [0.18, 0.13, 0.10],
      midCol:  [0.86, 0.76, 0.62],
      altCol:  [0.94, 0.78, 0.68],
      tipCol:  [1.00, 0.97, 0.91],
      rimCol:  [1.00, 0.78, 0.48],
      skyCol:  [0.06, 0.05, 0.07]
    },
    {
      name: '02 — PV Plush · Velvet Pillar Cathedral',
      // Dense, silky straight velvet micro-columns in dusty rose, berry & violet-pearl sheen
      height: 2.65,
      radius: 0.044,
      curlAmp: 0.03,
      curlTurns: 2.0,
      arch: 0.20,
      domeAmp: 0.03,
      swayAmp: 0.34,
      rootCol: [0.16, 0.06, 0.11],
      midCol:  [0.78, 0.42, 0.52],
      altCol:  [0.64, 0.40, 0.62],
      tipCol:  [0.99, 0.82, 0.88],
      rimCol:  [1.00, 0.68, 0.82],
      skyCol:  [0.07, 0.04, 0.07]
    },
    {
      name: '03 — Velboa · Golden Micro-Tuft Meadow',
      // Short, dense, velvety honey-amber, terracotta & warm gold tufts
      height: 1.65,
      radius: 0.060,
      curlAmp: 0.025,
      curlTurns: 1.5,
      arch: 0.09,
      domeAmp: 0.04,
      swayAmp: 0.18,
      rootCol: [0.19, 0.10, 0.04],
      midCol:  [0.82, 0.52, 0.22],
      altCol:  [0.88, 0.42, 0.24],
      tipCol:  [1.00, 0.86, 0.56],
      rimCol:  [1.00, 0.76, 0.36],
      skyCol:  [0.07, 0.05, 0.04]
    },
    {
      name: '04 — Minky / Super Soft · Silky Dimple-Dome Valley',
      // Rolling 3D Minky dimple hills with ultra-fine sage, mint & seafoam-silver filaments
      height: 1.95,
      radius: 0.040,
      curlAmp: 0.05,
      curlTurns: 2.6,
      arch: 0.24,
      domeAmp: 0.72,
      swayAmp: 0.30,
      rootCol: [0.06, 0.14, 0.11],
      midCol:  [0.38, 0.64, 0.52],
      altCol:  [0.36, 0.62, 0.68],
      tipCol:  [0.84, 0.97, 0.89],
      rimCol:  [0.64, 1.00, 0.86],
      skyCol:  [0.04, 0.07, 0.07]
    },
    {
      name: '05 — Faux Fur · Long-Pile Silk Canopy',
      // Sweeping, multi-layered long-pile fur shafts in oatmeal, amber-champagne & warm pearl
      height: 3.25,
      radius: 0.042,
      curlAmp: 0.07,
      curlTurns: 2.0,
      arch: 0.82,
      domeAmp: 0.04,
      swayAmp: 0.48,
      rootCol: [0.16, 0.11, 0.08],
      midCol:  [0.76, 0.62, 0.48],
      altCol:  [0.86, 0.66, 0.52],
      tipCol:  [1.00, 0.95, 0.88],
      rimCol:  [1.00, 0.84, 0.64],
      skyCol:  [0.06, 0.05, 0.05]
    },
    {
      name: '06 — Polar Fleece · Bioluminescent Thermal Cloud',
      // Brushed, curled thermal loops in deep sapphire, cyan-ice & soft violet glow
      height: 2.20,
      radius: 0.050,
      curlAmp: 0.20,
      curlTurns: 4.5,
      arch: 0.42,
      domeAmp: 0.22,
      swayAmp: 0.28,
      rootCol: [0.04, 0.08, 0.18],
      midCol:  [0.18, 0.42, 0.76],
      altCol:  [0.38, 0.34, 0.78],
      tipCol:  [0.68, 0.88, 1.00],
      rimCol:  [0.45, 0.86, 1.00],
      skyCol:  [0.03, 0.05, 0.10]
    }
  ];

  /* ---------- Global 3D Flow & Forest State ---------- */
  const flowState = {
    mode: 'sea',
    fabricIdx: 0,
    warpPulse: 0,
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
      flowState.fabricIdx = cleanIdx;
      flowState.warpPulse = 1.0;
    } else {
      flowState.warpPulse = Math.max(flowState.warpPulse, 0.65);
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
     2. WEBGL 3D MICROSCOPIC FIBER FOREST (#hero-canvas)
        - 1,350 slender, silky, multi-toned 3D fibers (32 smooth segments each)
        - Screen-space tangent-normal ribbon extrusion (zero bowtie twists/glitches)
        - True homogeneous perspective projection + smooth near/far horizon envelope
     ========================================================================== */
  function initMicroForestWebGL() {
    const canvas = $('#hero-canvas');
    if (!canvas) return null;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    if (!gl) return null;

    const vsSource = `
      attribute vec4 aFiber; // x: rootX, y: rawZ, z: s (0..1), w: side (-1..1)
      attribute float aSeed;

      uniform float uTime;
      uniform float uCamZ;
      uniform float uAspect;
      uniform vec2 uMouse;
      uniform float uMode;
      uniform float uWarp;

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

      // Evaluates a single point on the 3D fiber spine in camera space
      vec3 evalSpine(float rootX, float rawZ, float worldZ, float env, float s, float seed) {
        // Hermite smooth emergence from the knit base (vertical at root, smooth bend above)
        float smoothS = s * s * (3.0 - 2.0 * s);

        // Raised Minky dimple-dome hills on the woven floor
        float dome = sin(rootX * 0.85) * cos(rawZ * 0.85) * uDomeAmp * env;

        // Sea / Sky wind wave travelling through the canopy
        float freq = mix(0.9, 1.5, uMode);
        float windPhase = uTime * freq + rootX * 0.42 + rawZ * 0.32 + seed * 6.28318;
        float swayX = sin(windPhase) * uSwayAmp * smoothS;
        float swayZ = cos(windPhase * 0.85) * (uSwayAmp * 0.5) * smoothS;

        // Smooth 3D bouclé spiral wave (monotonic in Y so ribbons never flip or twist)
        float curlAngle = s * uCurlTurns + seed * 6.28318 + uTime * 0.55;
        float curlEnv = sin(s * 3.14159) * smoothS;
        float curlX = cos(curlAngle) * uCurlAmp * curlEnv;
        float curlZ = sin(curlAngle) * (uCurlAmp * 0.65) * curlEnv;

        // Sweeping fur arch
        float archAngle = (seed - 0.5) * 2.2;
        float archX = sin(archAngle) * uArch * smoothS * s;
        float archZ = cos(archAngle) * (uArch * 0.35) * smoothS * s;

        float wx = rootX + swayX + curlX + archX;
        float wz = worldZ + swayZ + curlZ + archZ;

        // Interactive cursor wind-parting sphere
        float cursorX = (uMouse.x - 0.5) * 10.0;
        float dx = wx - cursorX;
        float dz = wz - 5.5;
        float push = exp(-(dx * dx + dz * dz) * 0.20) * smoothS * 1.15;
        wx += sign(dx + 0.001) * push;

        float h = uHeight * (0.86 + 0.28 * seed);
        float wy = dome + s * h;

        // Camera slightly higher & wider so fibers look delicate, refined & dense
        float camX = (uMouse.x - 0.5) * 2.2;
        float camY = 1.48 + (0.5 - uMouse.y) * 0.40;
        vec3 rel = vec3(wx - camX, wy - camY, wz);

        float pitch = 0.03 + (0.5 - uMouse.y) * 0.08;
        float cp = cos(pitch), sp = sin(pitch);
        return vec3(
          rel.x,
          rel.y * cp + rel.z * sp,
          rel.z * cp - rel.y * sp
        );
      }

      void main() {
        float rootX = aFiber.x;
        float rawZ  = aFiber.y;
        float s     = aFiber.z;
        float side  = aFiber.w;

        // Infinite wrapping Z corridor [2.2 .. 24.2] with smooth fade-in/out envelope
        float spanZ = 22.0;
        float zRel = mod(rawZ - uCamZ, spanZ);
        if (zRel < 0.0) zRel += spanZ;
        float worldZ = zRel + 2.2;

        // Envelope smoothly tapers fiber thickness to 0 at far horizon & near plane (zero popping!)
        float env = smoothstep(0.2, 2.8, zRel) * smoothstep(spanZ, spanZ - 3.8, zRel);
        if (env <= 0.01) {
          gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
          return;
        }

        vec3 p0 = evalSpine(rootX, rawZ, worldZ, env, s, aSeed);
        vec3 p1 = evalSpine(rootX, rawZ, worldZ, env, min(1.0, s + 0.035), aSeed);

        // Clamp slope so the ribbon normal is always smooth and never flips 180 deg
        float dx = p1.x - p0.x;
        float dy = max(0.025, abs(p1.y - p0.y));
        float slope = clamp(dx / dy, -0.65, 0.65);
        vec2 norm2d = normalize(vec2(1.0, -slope * 0.45));

        // Smooth root-to-tip taper + soft rounded tip cap
        float tipCap = sqrt(max(0.0, 1.0 - pow(s, 3.0)));
        float taper = mix(1.0, 0.28, s) * tipCap;
        float rad = uRadius * taper * env;

        p0.x += side * rad * norm2d.x;
        p0.y += side * rad * norm2d.y;

        float fov = 1.78 - uWarp * 0.22;
        float z0 = max(1.2, p0.z);
        vec2 finalNdc = vec2((p0.x * fov) / (z0 * uAspect), (p0.y * fov) / z0);

        // Proper homogeneous perspective depth (near = 1.0, far = 26.0) + per-fiber micro-offset
        float near = 1.0;
        float far = 26.0;
        float zAdj = z0 + aSeed * 0.015;
        float ndcZ = ((far + near) / (far - near)) - (2.0 * far * near) / ((far - near) * zAdj);

        gl_Position = vec4(finalNdc * zAdj, ndcZ * zAdj, zAdj);

        vS = s;
        vSide = side;
        vDepth = clamp((z0 - 2.2) / 21.0, 0.0, 1.0);
        vSeed = aSeed;
      }
    `;

    const fsSource = `
      precision highp float;
      varying float vS;
      varying float vSide;
      varying float vDepth;
      varying float vSeed;

      uniform vec3 uRootCol;
      uniform vec3 uMidCol;
      uniform vec3 uAltCol;
      uniform vec3 uTipCol;
      uniform vec3 uRimCol;
      uniform vec3 uSkyCol;
      uniform float uTime;
      uniform float uWarp;

      void main() {
        // Smooth 3D cylinder normal across ribbon width (-1..1)
        float nx = clamp(vSide, -0.99, 0.99);
        float nz = sqrt(max(0.02, 1.0 - nx * nx));
        vec3 normal = normalize(vec3(nx, 0.18, nz));

        // Multi-tone yarn melange: blend between midCol and altCol per fiber seed
        float toneMix = fract(vSeed * 7.13);
        vec3 shaftCol = mix(uMidCol, uAltCol, toneMix);

        // Fine micro-fibril silk ridges along the length of each fiber
        float microSheen = 0.96 + 0.04 * sin(vS * 55.0 + vSeed * 25.0);

        // Rich 3-stage color gradient from deep knit root -> multi-tone shaft -> luminous tip
        vec3 baseCol = mix(uRootCol, shaftCol, smoothstep(0.0, 0.42, vS));
        baseCol = mix(baseCol, uTipCol, smoothstep(0.45, 0.98, vS));
        baseCol *= microSheen * (0.92 + 0.16 * vSeed);

        // Dual directional lighting + Kajiya-Kay velvet rim & iridescent sheen
        vec3 light1 = normalize(vec3(0.45, 0.65, 0.61));
        vec3 light2 = normalize(vec3(-0.55, 0.35, 0.75));
        float diff1 = max(0.0, dot(normal, light1));
        float diff2 = max(0.0, dot(normal, light2));
        float rim = pow(1.0 - nz, 1.85);
        float spec = pow(max(0.0, dot(normal, normalize(vec3(0.15, 0.58, 0.80)))), 18.0);

        // Root ambient occlusion near the knitted backing
        float ao = smoothstep(0.0, 0.24, vS) * 0.82 + 0.18;

        vec3 col = baseCol * (0.48 + 0.52 * diff1 + 0.22 * diff2) * ao;
        col = mix(col, uRimCol, rim * (0.48 + 0.38 * vS));
        col += uRimCol * spec * (0.30 + 0.35 * uWarp);

        // Iridescent micro-shimmer near fiber tips
        vec3 iri = 0.5 + 0.5 * cos(6.28318 * (vSeed + vS * 0.5 + uTime * 0.08 + vec3(0.0, 0.33, 0.67)));
        col += iri * rim * vS * 0.11;

        // Atmospheric depth fog into the forest horizon
        float fog = smoothstep(0.06, 0.96, vDepth);
        vec3 fogCol = uSkyCol + uRimCol * (0.04 + 0.07 * uWarp);
        col = mix(col, fogCol, fog * 0.92);

        gl_FragColor = vec4(col, 1.0);
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

    // 1,350 slender 3D fibers × 32 smooth segments each = 259,200 vertices
    const COLS = 45;
    const ROWS = 30;
    const FIBER_COUNT = COLS * ROWS;
    const SEGS = 32;
    const FLOATS_PER_VERT = 5;
    const verts = new Float32Array(FIBER_COUNT * SEGS * 6 * FLOATS_PER_VERT);

    let ptr = 0;
    function pushVert(rx, rz, s, side, seed) {
      verts[ptr++] = rx;
      verts[ptr++] = rz;
      verts[ptr++] = s;
      verts[ptr++] = side;
      verts[ptr++] = seed;
    }

    let rng = 1337;
    function rand() {
      rng = (rng * 16807) % 2147483647;
      return (rng - 1) / 2147483646;
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const u = (c + (rand() - 0.5) * 0.85) / COLS;
        const rootX = (u - 0.45) * 18.5;
        const rootZ = (r + (rand() - 0.5) * 0.85) * (22.0 / ROWS);
        const seed = rand();

        for (let seg = 0; seg < SEGS; seg++) {
          const s0 = seg / SEGS;
          const s1 = (seg + 1) / SEGS;
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
      altCol:    gl.getUniformLocation(prog, 'uAltCol'),
      tipCol:    gl.getUniformLocation(prog, 'uTipCol'),
      rimCol:    gl.getUniformLocation(prog, 'uRimCol'),
      skyCol:    gl.getUniformLocation(prog, 'uSkyCol')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND); // Pure hardware depth occlusion eliminates alpha Z-fighting

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
      lerp3(cur.altCol,  target.altCol,  morphSpeed);
      lerp3(cur.tipCol,  target.tipCol,  morphSpeed);
      lerp3(cur.rimCol,  target.rimCol,  morphSpeed);
      lerp3(cur.skyCol,  target.skyCol,  morphSpeed);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      const baseSpeed = flowState.mode === 'sky' ? 1.25 : 0.72;
      const warpSpeed = flowState.warpPulse * 11.5;
      flowState.camZ = (flowState.camZ + (baseSpeed + warpSpeed) * dt) % 22.0;
      flowState.warpPulse *= 0.93;

      gl.clearColor(cur.skyCol[0], cur.skyCol[1], cur.skyCol[2], 0.88);
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
      gl.uniform3fv(uLoc.altCol,  cur.altCol);
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

    const COUNT = 46;
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
        const hx = (flowState.mouseX - 0.5) * -16;
        const hy = (flowState.mouseY - 0.5) * -12 + Math.sin(t * freq) * 5;
        const hrx = (0.5 - flowState.mouseY) * 4.0 + Math.cos(t * 0.8) * 1.0;
        const hry = (flowState.mouseX - 0.5) * 5.0 + Math.sin(t * 0.7) * 1.2;
        heroContent.style.setProperty('--hx', `${hx.toFixed(2)}px`);
        heroContent.style.setProperty('--hy', `${hy.toFixed(2)}px`);
        heroContent.style.setProperty('--hrx', `${hrx.toFixed(2)}deg`);
        heroContent.style.setProperty('--hry', `${hry.toFixed(2)}deg`);
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
