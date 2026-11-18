/**
 * Loom X (Pvt) Ltd — Site & 3D Close-Up Macro Fabric Pile Engine (v5)
 * - Zero floating dust/flakes across the page
 * - Glitch-free Vertex-Locked 3D Macro Cloth & Pile Relief Mesh (120×120):
 *   locks texture UVs 1:1 to the 3D mesh vertices (eliminating 100% of
 *   vertex-swimming, tiling seams, and mirror-reversal glitches) while the
 *   3D camera glides at extreme close-up ant-eye magnification over the
 *   billowing 3D macro fabric surface.
 * - Magical 3D wave-front warp transitions between all 6 fabrics
 * - 60fps 3D card buoyancy, scroll-flight inertia & magnetic 3D card tilt
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Real Close-Up Macro Fabric Worlds ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Pile (Close-Up)',
      img: 'assets/images/play-boa.jpg',
      reliefAmp: 0.22,
      waveAmp: 0.16,
      zoom: 0.36,
      rimCol: [1.00, 0.90, 0.75],
      skyCol: [0.06, 0.05, 0.05]
    },
    {
      name: '02 — PV Plush · Dense Sheared Velvet Pile (Close-Up)',
      img: 'assets/images/pv-plush.jpg',
      reliefAmp: 0.20,
      waveAmp: 0.18,
      zoom: 0.36,
      rimCol: [1.00, 0.80, 0.88],
      skyCol: [0.07, 0.04, 0.06]
    },
    {
      name: '03 — Velboa · Short Sculpted Plush Pile (Close-Up)',
      img: 'assets/images/velboa.jpg',
      reliefAmp: 0.18,
      waveAmp: 0.17,
      zoom: 0.37,
      rimCol: [1.00, 0.86, 0.60],
      skyCol: [0.07, 0.05, 0.03]
    },
    {
      name: '04 — Minky / Super Soft · 3D Dimple-Dome Plush (Close-Up)',
      img: 'assets/images/minky.jpg',
      reliefAmp: 0.24,
      waveAmp: 0.15,
      zoom: 0.36,
      rimCol: [0.82, 1.00, 0.88],
      skyCol: [0.04, 0.06, 0.05]
    },
    {
      name: '05 — Faux Fur · Layered Long-Pile Fur (Close-Up)',
      img: 'assets/images/faux-fur.jpg',
      reliefAmp: 0.24,
      waveAmp: 0.19,
      zoom: 0.35,
      rimCol: [1.00, 0.92, 0.78],
      skyCol: [0.06, 0.05, 0.04]
    },
    {
      name: '06 — Polar Fleece · Brushed Thermal Nap (Close-Up)',
      img: 'assets/images/polar-fleece.jpg',
      reliefAmp: 0.19,
      waveAmp: 0.16,
      zoom: 0.37,
      rimCol: [0.68, 0.86, 1.00],
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
     2. WEBGL 3D CLOSE-UP MACRO FABRIC PILE ENGINE (#hero-canvas)
        - Locks texture UVs 1:1 to a 120×120 3D cloth mesh (zero vertex-swimming,
          zero tiling seams, zero mirror-reversal glitches!)
        - Zooms the 3D camera in to extreme close-up macro level so individual
          Play Boa curls, PV Plush velvet tufts, Velboa knit rows, Minky dimples,
          Faux Fur strands, and Polar Fleece nap are huge, crisp, and touchable.
        - Gently billows the 3D fabric sheet like a calm sea or sky breeze while
          the 3D camera glides smoothly across the close-up pile surface.
     ========================================================================== */
  function initCloseUpMacroFabricWebGL() {
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
      attribute vec2 aGrid; // x in [-1, 1], y in [-1, 1]

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMorph;
      uniform float uTime;
      uniform float uAspect;
      uniform vec2 uMouse;
      uniform float uMode;      // 0 = sea drift, 1 = sky breeze
      uniform float uWarp;      // 0..1 warp speed pulse
      uniform float uReliefAmp;
      uniform float uWaveAmp;
      uniform float uZoom;

      varying vec2 vTexUv;
      varying float vRelief;
      varying float vWaveHeight;
      varying float vMorphMask;
      varying vec2 vScreenUv;

      // 9-tap Gaussian-smoothed luminance locked to vertex UV (zero swimming!)
      float samplePillowLum(sampler2D tex, vec2 uv) {
        const float r = 0.014;
        vec3 c0 = texture2D(tex, uv).rgb * 0.28;
        c0 += texture2D(tex, uv + vec2(r, 0.0)).rgb * 0.12;
        c0 += texture2D(tex, uv - vec2(r, 0.0)).rgb * 0.12;
        c0 += texture2D(tex, uv + vec2(0.0, r)).rgb * 0.12;
        c0 += texture2D(tex, uv - vec2(0.0, r)).rgb * 0.12;
        c0 += texture2D(tex, uv + vec2(r, r)).rgb * 0.06;
        c0 += texture2D(tex, uv + vec2(-r, r)).rgb * 0.06;
        c0 += texture2D(tex, uv + vec2(r, -r)).rgb * 0.06;
        c0 += texture2D(tex, uv + vec2(-r, -r)).rgb * 0.06;
        return dot(c0, vec3(0.333));
      }

      void main() {
        float speed = mix(0.55, 0.95, uMode);
        float t = uTime * speed;

        // Lock close-up macro UV 100% to each mesh vertex (zero vertex-swimming!)
        vec2 uv = vec2(0.5, 0.5) + aGrid * vec2(uZoom, uZoom * 0.85);
        uv = clamp(uv, 0.03, 0.97);

        // Sweeping diagonal 3D wave-front when morphing from fabric A to fabric B
        float diag = (aGrid.x * 0.4 + aGrid.y * 0.6) * 0.5 + 0.5;
        float waveFront = smoothstep(diag - 0.22, diag + 0.22, uMorph * 1.44 - 0.22);

        // True 3D pile tuft & curl elevation permanently locked to its own vertex
        float lumA = samplePillowLum(uTexA, uv);
        float lumB = samplePillowLum(uTexB, uv);
        float lum = mix(lumA, lumB, waveFront);
        float tuftRelief = smoothstep(0.08, 0.92, lum) * uReliefAmp;

        // Gentle, large-scale 3D sea/sky cloth billowing
        float w1 = sin(aGrid.x * 2.2 + aGrid.y * 1.6 - t * 1.05) * uWaveAmp;
        float w2 = cos(aGrid.x * 1.5 - aGrid.y * 2.2 + t * 0.82) * (uWaveAmp * 0.7);
        float warpRipple = sin(diag * 7.0 - uMorph * 6.283) * uWarp * 0.16;

        // Interactive cursor 3D touch depression & pile brushing
        vec2 cursorGrid = vec2((uMouse.x - 0.5) * 2.0, (0.5 - uMouse.y) * 2.0);
        float d2 = dot(aGrid - cursorGrid, aGrid - cursorGrid);
        float touchLift = exp(-d2 * 2.6) * 0.12;

        // Smooth 3D camera orbit & drift in 3D space (instead of sliding UVs)
        float camX = sin(t * 0.42) * 0.18 + (uMouse.x - 0.5) * 0.24;
        float camY = cos(t * 0.34) * 0.14 + (0.5 - uMouse.y) * 0.20;

        // 3D cloth plane tilted in perspective
        float wx = aGrid.x * 2.18 * uAspect - camX;
        float wy = aGrid.y * 1.45 - camY + (w1 + w2 + warpRipple) * 0.42;
        float wz = 2.45 - aGrid.y * 0.58 - (tuftRelief + w1 + w2 + warpRipple + touchLift);

        // Subtle 3D camera tilt with cursor
        float rotX = (uMouse.y - 0.5) * 0.14 + sin(t * 0.4) * 0.04;
        float rotY = (uMouse.x - 0.5) * 0.16 + cos(t * 0.35) * 0.04;

        float cy = cos(rotY), sy = sin(rotY);
        float x1 = wx * cy - (wz - 2.5) * sy;
        float z1 = wx * sy + (wz - 2.5) * cy + 2.5;

        float cx = cos(rotX), sx = sin(rotX);
        float y2 = wy * cx - (z1 - 2.5) * sx;
        float z2 = wy * sx + (z1 - 2.5) * cx + 2.5;

        float fov = 1.68 + uWarp * 0.12;
        float zSafe = max(0.8, z2);
        float near = 0.6;
        float far = 8.0;
        float ndcZ = ((far + near) / (far - near)) - (2.0 * far * near) / ((far - near) * zSafe);

        gl_Position = vec4(
          (x1 * fov) / uAspect,
          y2 * fov,
          ndcZ * zSafe,
          zSafe
        );

        vTexUv = uv;
        vRelief = smoothstep(0.08, 0.92, lum);
        vWaveHeight = w1 + w2;
        vMorphMask = waveFront;
        vScreenUv = aGrid;
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vTexUv;
      varying float vRelief;
      varying float vWaveHeight;
      varying float vMorphMask;
      varying vec2 vScreenUv;

      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform vec3 uRimCol;
      uniform float uWarp;

      void main() {
        // Razor-sharp close-up studio macro fabric photograph
        vec3 colA = texture2D(uTexA, vTexUv).rgb;
        vec3 colB = texture2D(uTexB, vTexUv).rgb;
        vec3 texCol = mix(colA, colB, vMorphMask);

        // Fine 3D fiber normal from close-up texture gradient for plush velvet sheen
        float eps = 0.0025;
        vec3 tx = mix(texture2D(uTexA, vTexUv + vec2(eps, 0.0)).rgb, texture2D(uTexB, vTexUv + vec2(eps, 0.0)).rgb, vMorphMask);
        vec3 ty = mix(texture2D(uTexA, vTexUv + vec2(0.0, eps)).rgb, texture2D(uTexB, vTexUv + vec2(0.0, eps)).rgb, vMorphMask);
        float dx = dot(tx - texCol, vec3(0.333));
        float dy = dot(ty - texCol, vec3(0.333));
        vec3 normal = normalize(vec3(-dx * 3.8, -dy * 3.8, 1.0));

        // Soft studio key light + velvet grazing rim highlight
        vec3 lightDir = normalize(vec3(0.35, 0.45, 0.82));
        float diff = max(0.0, dot(normal, lightDir));
        float rim = pow(clamp(1.0 - normal.z, 0.0, 1.0), 1.4);

        // Subtle crevice AO & plush crest sheen that preserves true fabric color
        float ao = mix(0.88, 1.06, vRelief);
        vec3 lit = texCol * (0.82 + 0.25 * diff) * ao;
        lit += uRimCol * rim * (0.14 + 0.16 * vRelief);
        lit += uRimCol * max(0.0, vWaveHeight) * 0.12;

        // Magical glowing wave crest when morphing from fabric to fabric
        float warpEdge = 4.0 * vMorphMask * (1.0 - vMorphMask);
        lit += uRimCol * warpEdge * uWarp * 0.28;

        gl_FragColor = vec4(lit, 1.0);
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

    // 120 × 120 subdivided 3D cloth grid spanning [-1.15, 1.15] so edges never show during 3D tilt
    const NX = 120;
    const NY = 120;
    const verts = new Float32Array(NX * NY * 6 * 2);
    let p = 0;
    function push(x, y) {
      verts[p++] = x;
      verts[p++] = y;
    }
    const EXT = 1.18;
    for (let j = 0; j < NY; j++) {
      const y0 = ((j / NY) * 2.0 - 1.0) * EXT;
      const y1 = (((j + 1) / NY) * 2.0 - 1.0) * EXT;
      for (let i = 0; i < NX; i++) {
        const x0 = ((i / NX) * 2.0 - 1.0) * EXT;
        const x1 = (((i + 1) / NX) * 2.0 - 1.0) * EXT;
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

    let texturesReady = 0;
    let fileProtocolBlocked = false;
    const textures = FABRIC_WORLDS.map((fw) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
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
      aspect:    gl.getUniformLocation(prog, 'uAspect'),
      mouse:     gl.getUniformLocation(prog, 'uMouse'),
      mode:      gl.getUniformLocation(prog, 'uMode'),
      warp:      gl.getUniformLocation(prog, 'uWarp'),
      reliefAmp: gl.getUniformLocation(prog, 'uReliefAmp'),
      waveAmp:   gl.getUniformLocation(prog, 'uWaveAmp'),
      zoom:      gl.getUniformLocation(prog, 'uZoom'),
      rimCol:    gl.getUniformLocation(prog, 'uRimCol')
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
    const totalVerts = NX * NY * 6;
    const lerp = (a, b, k) => a + (b - a) * k;
    const lerp3 = (arr, target, k) => {
      arr[0] = lerp(arr[0], target[0], k);
      arr[1] = lerp(arr[1], target[1], k);
      arr[2] = lerp(arr[2], target[2], k);
    };

    return function renderCloseUp(timeSec, dt) {
      if (fileProtocolBlocked || texturesReady === 0) return;
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const target = FABRIC_WORLDS[flowState.fabricIdx] || FABRIC_WORLDS[0];
      const morphSpeed = 0.08;

      flowState.morphProg = Math.min(1.0, flowState.morphProg + dt * 1.5);
      flowState.warpPulse *= 0.93;

      cur.reliefAmp = lerp(cur.reliefAmp, target.reliefAmp, morphSpeed);
      cur.waveAmp   = lerp(cur.waveAmp,   target.waveAmp,   morphSpeed);
      cur.zoom      = lerp(cur.zoom,      target.zoom,      morphSpeed);
      lerp3(cur.rimCol, target.rimCol, morphSpeed);
      lerp3(cur.skyCol, target.skyCol, morphSpeed);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

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
      gl.uniform1f(uLoc.aspect, Math.max(0.5, canvas.width / Math.max(1, canvas.height)));
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform1f(uLoc.warp, flowState.warpPulse);
      gl.uniform1f(uLoc.reliefAmp, cur.reliefAmp);
      gl.uniform1f(uLoc.waveAmp, cur.waveAmp);
      gl.uniform1f(uLoc.zoom, cur.zoom);
      gl.uniform3fv(uLoc.rimCol, cur.rimCol);

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

        if (heroImgEl) {
          const ix = (flowState.mouseX - 0.5) * 28 + Math.sin(t * freq * 0.8) * 12;
          const iy = (flowState.mouseY - 0.5) * 18 + Math.cos(t * freq * 0.7) * 8;
          const scale = 1.24 + flowState.warpPulse * 0.14;
          heroImgEl.style.transform = `perspective(900px) scale(${scale.toFixed(3)}) translate3d(${ix.toFixed(1)}px, ${iy.toFixed(1)}px, 0) rotateX(${(5 + (0.5 - flowState.mouseY) * 6).toFixed(2)}deg) rotateY(${((flowState.mouseX - 0.5) * 6).toFixed(2)}deg)`;
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
  const renderCloseUp = initCloseUpMacroFabricWebGL();
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

    if (renderCloseUp) renderCloseUp(t, dt);
    if (updateSpatial3D) updateSpatial3D(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
