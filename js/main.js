/**
 * Loom X (Pvt) Ltd — Site & 3D Macro-Scale Textile Pile Landscape Engine (v4)
 * - Zero floating dust/flakes across the page
 * - Real-time WebGL 3D Subdivided (120×120) Macro Fabric Pile Terrain:
 *   maps the actual studio macro photographs of all 6 fabrics (Play Boa,
 *   PV Plush, Velboa, Minky, Faux Fur, Polar Fleece) onto an infinite,
 *   seamless 3D undulating cloth & tuft-relief landscape at ant-eye scale.
 * - Magical 3D wave-front warp transitions from fabric to fabric
 * - 60fps 3D card buoyancy, scroll-flight inertia & magnetic 3D card tilt
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Real Macro Fabric Worlds ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Pile',
      img: 'assets/images/play-boa.jpg',
      reliefAmp: 0.42,
      waveAmp: 0.28,
      texScale: 0.24,
      rimCol: [1.00, 0.88, 0.72],
      skyCol: [0.05, 0.05, 0.05]
    },
    {
      name: '02 — PV Plush · Dense Sheared Velvet Pile',
      img: 'assets/images/pv-plush.jpg',
      reliefAmp: 0.36,
      waveAmp: 0.34,
      texScale: 0.22,
      rimCol: [1.00, 0.78, 0.86],
      skyCol: [0.06, 0.04, 0.05]
    },
    {
      name: '03 — Velboa · Short Sculpted Plush Pile',
      img: 'assets/images/velboa.jpg',
      reliefAmp: 0.28,
      waveAmp: 0.30,
      texScale: 0.22,
      rimCol: [1.00, 0.84, 0.56],
      skyCol: [0.06, 0.04, 0.03]
    },
    {
      name: '04 — Minky / Super Soft · 3D Dimple-Dome Plush',
      img: 'assets/images/minky.jpg',
      reliefAmp: 0.44,
      waveAmp: 0.26,
      texScale: 0.23,
      rimCol: [0.80, 1.00, 0.86],
      skyCol: [0.04, 0.06, 0.05]
    },
    {
      name: '05 — Faux Fur · Layered Long-Pile Fur',
      img: 'assets/images/faux-fur.jpg',
      reliefAmp: 0.48,
      waveAmp: 0.36,
      texScale: 0.22,
      rimCol: [1.00, 0.90, 0.74],
      skyCol: [0.06, 0.05, 0.04]
    },
    {
      name: '06 — Polar Fleece · Brushed Thermal Nap',
      img: 'assets/images/polar-fleece.jpg',
      reliefAmp: 0.34,
      waveAmp: 0.28,
      texScale: 0.24,
      rimCol: [0.64, 0.84, 1.00],
      skyCol: [0.03, 0.05, 0.08]
    }
  ];

  /* ---------- Global 3D Flow & Warp State ---------- */
  const flowState = {
    mode: 'sea',
    prevIdx: 0,
    fabricIdx: 0,
    morphProg: 1.0,
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
     2. WEBGL 3D DISPLACED MACRO FABRIC PILE TERRAIN (#hero-canvas)
        Extrudes the actual studio macro photographs of all 6 fabrics into a
        continuous 120×120 3D perspective cloth & tuft-relief landscape!
     ========================================================================== */
  function initMacroFabricTerrainWebGL() {
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
      attribute vec2 aGrid; // x in [-1, 1], y in [0, 1] (near to far)

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMorph;
      uniform float uTime;
      uniform float uCamZ;
      uniform float uAspect;
      uniform vec2 uMouse;
      uniform float uMode;      // 0 = sea drift, 1 = sky breeze
      uniform float uWarp;      // 0..1 warp speed pulse
      uniform float uReliefAmp;
      uniform float uWaveAmp;
      uniform float uTexScale;

      varying vec2 vTexUv;
      varying float vDepth;
      varying float vRelief;
      varying float vWaveSlope;
      varying float vMorphMask;

      // Seamless dual-offset mirrored sampling (zero tile seams during infinite flight)
      vec3 sampleSeamlessVS(sampler2D tex, vec2 uv) {
        vec2 uvA = 1.0 - abs(mod(uv, 2.0) - 1.0);
        vec2 uvB = 1.0 - abs(mod(uv + vec2(0.5, 0.5), 2.0) - 1.0);
        vec2 s = sin(uv * 3.14159265);
        float b = clamp(s.x * s.x * s.y * s.y * 1.6, 0.0, 1.0);
        uvA = mix(vec2(0.06), vec2(0.94), uvA);
        uvB = mix(vec2(0.06), vec2(0.94), uvB);
        return mix(texture2D(tex, uvB).rgb, texture2D(tex, uvA).rgb, b);
      }

      void main() {
        // World coordinates of the 3D fabric hillside rising ahead of the ant-eye camera
        float distZ = mix(1.15, 11.5, aGrid.y * aGrid.y * 0.25 + aGrid.y * 0.75);
        float spanX = mix(2.6, 11.5, aGrid.y) * uAspect;
        float wx = aGrid.x * spanX;
        float wz = distZ;

        float speed = mix(0.65, 1.15, uMode);
        float t = uTime * speed;

        // Scrolling macro-fabric UV as the ant camera flies forward over the pile
        vec2 scrollUv = vec2(wx * uTexScale, (wz + uCamZ) * uTexScale);
        scrollUv.x += sin(wz * 0.35 - t * 0.45) * 0.05;

        // Sweeping 3D wave-front transition mask when warping from fabric A to fabric B
        float waveFront = smoothstep(aGrid.y - 0.25, aGrid.y + 0.15, uMorph * 1.35);

        // Sample true macro fabric luminance to extrude real 3D bouclé curls, dimples & tufts
        vec3 colA = sampleSeamlessVS(uTexA, scrollUv);
        vec3 colB = sampleSeamlessVS(uTexB, scrollUv);
        float lumA = dot(colA, vec3(0.333));
        float lumB = dot(colB, vec3(0.333));
        float lum = mix(lumA, lumB, waveFront);

        // Plump 3D pile tuft relief extruded directly from the macro fabric texture
        float tuftHeight = smoothstep(0.08, 0.92, lum) * uReliefAmp * 1.45;

        // Macro rolling cloth waves (like fabric billowing in the sea or sky)
        float w1 = sin(wx * 0.55 + (wz + uCamZ * 0.6) * 0.48 - t * 0.9) * uWaveAmp;
        float w2 = cos(wx * 0.38 - (wz + uCamZ * 0.5) * 0.62 + t * 0.75) * (uWaveAmp * 0.75);
        float warpWave = sin(aGrid.y * 9.0 - uMorph * 8.0) * uWarp * 0.25;

        // Interactive cursor touch press & brush ripple on the plush surface
        float curX = (uMouse.x - 0.5) * 6.5;
        float curZ = 2.6 + (1.0 - uMouse.y) * 4.5;
        float d2 = (wx - curX) * (wx - curX) + (wz - curZ) * (wz - curZ);
        float touchPress = -exp(-d2 * 0.45) * 0.36;

        // Rise upward with distance so the 3D fabric landscape fills the entire viewport
        float hillRise = (distZ - 1.15) * 0.46 - 1.35;
        float wy = hillRise + w1 + w2 + warpWave + tuftHeight + touchPress;

        float camX = (uMouse.x - 0.5) * 1.1;
        float camY = 0.35 + (0.5 - uMouse.y) * 0.25;
        vec3 rel = vec3(wx - camX, wy - camY, wz);

        float pitch = 0.08 + (0.5 - uMouse.y) * 0.08;
        float cp = cos(pitch), sp = sin(pitch);
        vec3 viewPos = vec3(
          rel.x,
          rel.y * cp + rel.z * sp,
          rel.z * cp - rel.y * sp
        );

        float fov = 1.42 - uWarp * 0.15;
        float z0 = max(0.7, viewPos.z);
        float near = 0.6;
        float far = 16.0;
        float ndcZ = ((far + near) / (far - near)) - (2.0 * far * near) / ((far - near) * z0);

        gl_Position = vec4(
          (viewPos.x * fov) / uAspect,
          viewPos.y * fov,
          ndcZ * z0,
          z0
        );

        vTexUv = scrollUv;
        vDepth = clamp((distZ - 1.15) / 10.35, 0.0, 1.0);
        vRelief = smoothstep(0.08, 0.92, lum);
        vWaveSlope = w1 + w2;
        vMorphMask = waveFront;
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vTexUv;
      varying float vDepth;
      varying float vRelief;
      varying float vWaveSlope;
      varying float vMorphMask;

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform vec3 uRimCol;
      uniform vec3 uSkyCol;
      uniform float uWarp;

      vec3 sampleSeamlessFS(sampler2D tex, vec2 uv) {
        vec2 uvA = 1.0 - abs(mod(uv, 2.0) - 1.0);
        vec2 uvB = 1.0 - abs(mod(uv + vec2(0.5, 0.5), 2.0) - 1.0);
        vec2 s = sin(uv * 3.14159265);
        float b = clamp(s.x * s.x * s.y * s.y * 1.6, 0.0, 1.0);
        uvA = mix(vec2(0.06), vec2(0.94), uvA);
        uvB = mix(vec2(0.06), vec2(0.94), uvB);
        return mix(texture2D(tex, uvB).rgb, texture2D(tex, uvA).rgb, b);
      }

      void main() {
        // High-resolution studio macro fabric photograph at ant-eye scale
        vec3 colA = sampleSeamlessFS(uTexA, vTexUv);
        vec3 colB = sampleSeamlessFS(uTexB, vTexUv);
        vec3 texCol = mix(colA, colB, vMorphMask);

        // Estimate 3D micro-tuft normal from neighboring texels for velvet rim sheen
        float eps = 0.0045;
        vec3 cx = mix(sampleSeamlessFS(uTexA, vTexUv + vec2(eps, 0.0)), sampleSeamlessFS(uTexB, vTexUv + vec2(eps, 0.0)), vMorphMask);
        vec3 cy = mix(sampleSeamlessFS(uTexA, vTexUv + vec2(0.0, eps)), sampleSeamlessFS(uTexB, vTexUv + vec2(0.0, eps)), vMorphMask);
        float dx = dot(cx - texCol, vec3(0.333));
        float dy = dot(cy - texCol, vec3(0.333));
        vec3 normal = normalize(vec3(-dx * 4.5, 1.0, -dy * 4.5));

        // Soft studio lighting + Kajiya-Kay velvet rim highlight on tuft crests
        vec3 lightDir = normalize(vec3(0.38, 0.78, -0.48));
        float diff = max(0.0, dot(normal, lightDir));
        float rim = pow(clamp(1.0 - normal.y, 0.0, 1.0), 1.45);

        // Deepen crevice shadows slightly and brighten plush tuft tops for 3D pop
        float ao = mix(0.76, 1.18, vRelief);
        vec3 lit = texCol * (0.76 + 0.42 * diff) * ao;
        lit += uRimCol * rim * (0.24 + 0.32 * vRelief + 0.25 * uWarp);
        lit += uRimCol * max(0.0, vWaveSlope) * 0.14;

        // Magical glowing wave crest during fabric-to-fabric warp
        float warpBand = 4.0 * vMorphMask * (1.0 - vMorphMask);
        lit += uRimCol * warpBand * uWarp * 0.35;

        // Gentle atmospheric distance fog at the very top horizon
        float fog = smoothstep(0.45, 1.0, vDepth) * 0.62;
        gl_FragColor = vec4(mix(lit, uSkyCol, fog), 1.0);
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

    // Build 120 × 120 subdivided 3D cloth grid (28,800 triangles)
    const NX = 120;
    const NZ = 120;
    const verts = new Float32Array(NX * NZ * 6 * 2);
    let p = 0;
    function push(x, y) {
      verts[p++] = x;
      verts[p++] = y;
    }
    for (let j = 0; j < NZ; j++) {
      const y0 = j / NZ;
      const y1 = (j + 1) / NZ;
      for (let i = 0; i < NX; i++) {
        const x0 = (i / NX) * 2.0 - 1.0;
        const x1 = ((i + 1) / NX) * 2.0 - 1.0;
        push(x0, y0);
        push(x1, y0);
        push(x0, y1);

        push(x0, y1);
        push(x1, y0);
        push(x1, y1);
      }
    }

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aGrid = gl.getAttribLocation(prog, 'aGrid');
    gl.enableVertexAttribArray(aGrid);
    gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);

    // Load all 6 real studio macro fabric textures
    let texturesReady = 0;
    let fileProtocolBlocked = false;
    const textures = FABRIC_WORLDS.map((fw) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // 1x1 warm neutral placeholder until image loads
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([180, 165, 145, 255]));

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
          // If opened via local file:// protocol where WebGL blocks texture upload,
          // hide the WebGL canvas so the 3D-animated #hero-img shows the real macro photo!
          fileProtocolBlocked = true;
          canvas.classList.remove('is-ready');
        }
      };
      img.src = fw.img;
      return tex;
    });

    const uLoc = {
      texA:      gl.getUniformLocation(prog, 'uTexA'),
      texB:      gl.getUniformLocation(prog, 'uTexB'),
      morph:     gl.getUniformLocation(prog, 'uMorph'),
      time:      gl.getUniformLocation(prog, 'uTime'),
      camZ:      gl.getUniformLocation(prog, 'uCamZ'),
      aspect:    gl.getUniformLocation(prog, 'uAspect'),
      mouse:     gl.getUniformLocation(prog, 'uMouse'),
      mode:      gl.getUniformLocation(prog, 'uMode'),
      warp:      gl.getUniformLocation(prog, 'uWarp'),
      reliefAmp: gl.getUniformLocation(prog, 'uReliefAmp'),
      waveAmp:   gl.getUniformLocation(prog, 'uWaveAmp'),
      texScale:  gl.getUniformLocation(prog, 'uTexScale'),
      rimCol:    gl.getUniformLocation(prog, 'uRimCol'),
      skyCol:    gl.getUniformLocation(prog, 'uSkyCol')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

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
    const totalVerts = NX * NZ * 6;
    const lerp = (a, b, k) => a + (b - a) * k;
    const lerp3 = (arr, target, k) => {
      arr[0] = lerp(arr[0], target[0], k);
      arr[1] = lerp(arr[1], target[1], k);
      arr[2] = lerp(arr[2], target[2], k);
    };

    return function renderTerrain(timeSec, dt) {
      if (fileProtocolBlocked || texturesReady === 0) return;
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const target = FABRIC_WORLDS[flowState.fabricIdx] || FABRIC_WORLDS[0];
      const morphSpeed = 0.08;

      flowState.morphProg = Math.min(1.0, flowState.morphProg + dt * 1.8);
      cur.reliefAmp = lerp(cur.reliefAmp, target.reliefAmp, morphSpeed);
      cur.waveAmp   = lerp(cur.waveAmp,   target.waveAmp,   morphSpeed);
      cur.texScale  = lerp(cur.texScale,  target.texScale,  morphSpeed);
      lerp3(cur.rimCol, target.rimCol, morphSpeed);
      lerp3(cur.skyCol, target.skyCol, morphSpeed);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      const baseSpeed = flowState.mode === 'sky' ? 1.15 : 0.65;
      const warpSpeed = flowState.warpPulse * 9.5;
      flowState.camZ = (flowState.camZ + (baseSpeed + warpSpeed) * dt) % 100.0;
      flowState.warpPulse *= 0.93;

      gl.clearColor(cur.skyCol[0], cur.skyCol[1], cur.skyCol[2], 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[flowState.prevIdx] || textures[0]);
      gl.uniform1i(uLoc.texA, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[flowState.fabricIdx] || textures[0]);
      gl.uniform1i(uLoc.texB, 1);

      gl.uniform1f(uLoc.morph, flowState.morphProg);
      gl.uniform1f(uLoc.time, timeSec);
      gl.uniform1f(uLoc.camZ, flowState.camZ);
      gl.uniform1f(uLoc.aspect, Math.max(0.5, canvas.width / Math.max(1, canvas.height)));
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform1f(uLoc.warp, flowState.warpPulse);
      gl.uniform1f(uLoc.reliefAmp, cur.reliefAmp);
      gl.uniform1f(uLoc.waveAmp, cur.waveAmp);
      gl.uniform1f(uLoc.texScale, cur.texScale);
      gl.uniform3fv(uLoc.rimCol, cur.rimCol);
      gl.uniform3fv(uLoc.skyCol, cur.skyCol);

      gl.drawArrays(gl.TRIANGLES, 0, totalVerts);
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
        const hx = (flowState.mouseX - 0.5) * -14;
        const hy = (flowState.mouseY - 0.5) * -10 + Math.sin(t * freq) * 4;
        const hrx = (0.5 - flowState.mouseY) * 3.5 + Math.cos(t * 0.8) * 0.8;
        const hry = (flowState.mouseX - 0.5) * 4.5 + Math.sin(t * 0.7) * 1.0;
        heroContent.style.setProperty('--hx', `${hx.toFixed(2)}px`);
        heroContent.style.setProperty('--hy', `${hy.toFixed(2)}px`);
        heroContent.style.setProperty('--hrx', `${hrx.toFixed(2)}deg`);
        heroContent.style.setProperty('--hry', `${hry.toFixed(2)}deg`);

        // 3D fallback animation on #hero-img when opened via file://
        if (heroImgEl) {
          const ix = (flowState.mouseX - 0.5) * 28 + Math.sin(t * freq * 0.8) * 12;
          const iy = (flowState.mouseY - 0.5) * 18 + Math.cos(t * freq * 0.7) * 8;
          const scale = 1.18 + flowState.warpPulse * 0.14;
          heroImgEl.style.transform = `perspective(900px) scale(${scale.toFixed(3)}) translate3d(${ix.toFixed(1)}px, ${iy.toFixed(1)}px, 0) rotateX(${(4 + (0.5 - flowState.mouseY) * 6).toFixed(2)}deg) rotateY(${((flowState.mouseX - 0.5) * 6).toFixed(2)}deg)`;
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
  const renderTerrain = initMacroFabricTerrainWebGL();
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

    if (renderTerrain) renderTerrain(t, dt);
    if (updateSpatial3D) updateSpatial3D(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
