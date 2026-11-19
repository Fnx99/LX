/**
 * Loom X (Pvt) Ltd — Site & Overhead Macro Fabric Wave Engine
 * - Nav state on scroll + mobile menu
 * - Enquiry list: "Add to enquiry" on fabric cards syncs with the form chips
 * - Enquiry form composes a real WhatsApp / email message (no fake submit)
 * - Reveal on scroll
 * - Background-only WebGL 3D cloth ripple & lighting animation across all 6
 *   overhead macro fabric photos (zero floating text or moving cards)
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 6 Overhead 16:9 Macro Fabric Backgrounds ---------- */
  const FABRIC_WORLDS = [
    {
      name: '01 — Play Boa · Curled Bouclé Pile',
      img: 'assets/images/bg-play-boa.jpg',
      rimCol: [1.00, 0.90, 0.74]
    },
    {
      name: '02 — PV Plush · Dense Sheared Velvet',
      img: 'assets/images/bg-pv-plush.jpg',
      rimCol: [1.00, 0.80, 0.86]
    },
    {
      name: '03 — Velboa · Short Sculpted Plush',
      img: 'assets/images/bg-velboa.jpg',
      rimCol: [1.00, 0.86, 0.62]
    },
    {
      name: '04 — Minky / Super Soft · Raised Dimple Plush',
      img: 'assets/images/bg-minky.jpg',
      rimCol: [0.84, 0.98, 0.88]
    },
    {
      name: '05 — Faux Fur · Long-Pile Fur Locks',
      img: 'assets/images/bg-faux-fur.jpg',
      rimCol: [1.00, 0.92, 0.80]
    },
    {
      name: '06 — Polar Fleece · Brushed Thermal Nap',
      img: 'assets/images/bg-polar-fleece.jpg',
      rimCol: [0.72, 0.86, 1.00]
    }
  ];

  /* ---------- Background Flow State ---------- */
  const flowState = {
    mode: 'sea', // 'sea' (Gentle Wave) | 'sky' (Breeze Drift)
    prevIdx: 0,
    fabricIdx: 0,
    pendingIdx: null,
    morphProg: 1.0,
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    mouseEnergy: 0,
    scrollY: window.scrollY
  };

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const links = $('#nav-links');

  const onScroll = () => {
    flowState.scrollY = window.scrollY;
    nav.classList.toggle('is-scrolled', flowState.scrollY > 40);
  };
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

  /* ---------- Background Motion Controls ---------- */
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
      pureForestBtn.textContent = active ? 'Show Headline' : 'Inspect Fabric';
    });
  }

  /* ---------- Overhead Fabric Selector ---------- */
  const forestPills = $$('.forest-pill');
  const currentLabel = $('#forest-current-label');
  const heroImgEl = $('#hero-img');

  let requestTexture = () => {};

  function selectHeroFabric(idx, scrollToHero = false) {
    const cleanIdx = ((idx % FABRIC_WORLDS.length) + FABRIC_WORLDS.length) % FABRIC_WORLDS.length;

    if (currentLabel) currentLabel.textContent = FABRIC_WORLDS[cleanIdx].name;
    forestPills.forEach((pill, i) => {
      const active = i === cleanIdx;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-selected', String(active));
    });

    if (heroImgEl) heroImgEl.src = FABRIC_WORLDS[cleanIdx].img;
    requestTexture(cleanIdx);

    if (scrollToHero && heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  forestPills.forEach(pill => {
    pill.addEventListener('click', () => {
      selectHeroFabric(Number(pill.dataset.fabricIdx || 0), false);
    });
  });

  $$('[data-enter-forest]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectHeroFabric(Number(btn.dataset.enterForest || 0), true);
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
     POINTER TRACKER FOR HERO BACKGROUND RIPPLE ONLY
     ========================================================================== */
  if (heroSection) {
    heroSection.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const dist = Math.hypot(nx - flowState.targetMouseX, ny - flowState.targetMouseY);
      flowState.mouseEnergy = Math.min(1.0, flowState.mouseEnergy + dist * 2.2);
      flowState.targetMouseX = nx;
      flowState.targetMouseY = ny;
    }, { passive: true });
  }

  /* ==========================================================================
     WEBGL OVERHEAD MACRO CLOTH WAVE & LIGHTING BACKGROUND (#hero-canvas)
     - Uses true cover-fit UV mapping so 16:9 overhead fabric photos never stretch
     - Animates only the background cloth: smooth undulating cloth waves,
       synchronized raking light/shadow highlights across the real macro yarn
       texture, and seamless diagonal wave transitions when switching fabrics.
     ========================================================================== */
  function initOverheadClothWebGL() {
    const canvas = $('#hero-canvas');
    if (!canvas) return null;

    const gl = canvas.getContext('webgl', {
      alpha: false,
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
      uniform vec2 uRes;
      uniform vec2 uImgResA;
      uniform vec2 uImgResB;
      uniform float uMorph;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseEnergy;
      uniform float uMode; // 0 = gentle wave, 1 = breeze drift
      uniform vec3 uRimCol;

      // Exact CSS object-fit: cover UV calculation with slight overscan margin for wave displacement
      vec2 coverUv(vec2 uv, vec2 res, vec2 imgRes) {
        float rs = res.x / max(1.0, res.y);
        float ri = imgRes.x / max(1.0, imgRes.y);
        vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
        vec2 centered = (uv - 0.5) * scale * 0.94 + 0.5;
        return centered;
      }

      // Single unified smooth 3D cloth wave field
      float clothWave(vec2 uv, float t) {
        float aspect = uRes.x / max(1.0, uRes.y);
        vec2 p = vec2(uv.x * aspect, uv.y);

        float speed = mix(0.65, 1.15, uMode);
        float amp   = mix(1.0, 1.35, uMode);

        // Soft rolling diagonal folds sweeping smoothly across the cloth
        float w1 = sin(p.x * 2.6 + p.y * 1.9 - t * speed) * 0.50;
        float w2 = cos(p.x * 1.7 - p.y * 2.8 + t * speed * 0.78) * 0.34;
        float w3 = sin((p.x + p.y) * 4.2 - t * speed * 1.25) * 0.16;

        // Subtle localized cursor ripple when hovering the background
        vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
        float dist = length(p - mp);
        float cursorRipple = sin(dist * 16.0 - t * 4.0) * exp(-dist * 4.5) * (0.28 * uMouseEnergy);

        return (w1 + w2 + w3) * amp + cursorRipple;
      }

      vec3 sampleFabric(sampler2D tex, vec2 uv, vec2 imgRes, vec2 disp, vec2 waveGrad, vec3 lightDir) {
        vec2 baseUv = clamp(coverUv(uv, uRes, imgRes) + disp, 0.004, 0.996);
        vec3 col = texture2D(tex, baseUv).rgb;

        // Sample the real photograph's own fiber luminance gradient for authentic raking sheen
        float texEps = 0.0022;
        float lC = dot(col, vec3(0.333));
        float lX = dot(texture2D(tex, clamp(baseUv + vec2(texEps, 0.0), 0.004, 0.996)).rgb, vec3(0.333)) - lC;
        float lY = dot(texture2D(tex, clamp(baseUv + vec2(0.0, texEps), 0.004, 0.996)).rgb, vec3(0.333)) - lC;

        // Combine macro cloth fold normal with micro photo fiber normal
        vec3 n = normalize(vec3(
          -waveGrad.x * 0.22 - lX * 1.35,
          -waveGrad.y * 0.22 - lY * 1.35,
          1.0
        ));

        float diff = max(0.0, dot(n, lightDir));
        float wrapDiff = 0.80 + 0.34 * diff;
        float rimSheen = pow(clamp(1.0 - n.z, 0.0, 1.0), 1.8);

        vec3 lit = col * wrapDiff;
        lit += uRimCol * rimSheen * (0.10 + 0.12 * lC);
        return lit;
      }

      void main() {
        // Compute wave value and exact gradient in the same coordinate space
        float eps = 0.006;
        float wC = clothWave(vUv, uTime);
        float wX = (clothWave(vUv + vec2(eps, 0.0), uTime) - wC) / eps;
        float wY = (clothWave(vUv + vec2(0.0, eps), uTime) - wC) / eps;
        vec2 waveGrad = vec2(wX, wY);

        // Gently displace the real fabric photo along the wave slope so the cloth ripples
        vec2 disp = -waveGrad * 0.0032;

        // Slowly breathing raking light from upper-right across the cloth folds
        vec3 lightDir = normalize(vec3(0.45 + 0.12 * sin(uTime * 0.4), -0.45 + 0.10 * cos(uTime * 0.35), 0.76));

        vec3 colB = sampleFabric(uTexB, vUv, uImgResB, disp, waveGrad, lightDir);

        vec3 outCol = colB;
        if (uMorph < 0.999) {
          vec3 colA = sampleFabric(uTexA, vUv, uImgResA, disp, waveGrad, lightDir);
          // Smooth diagonal cloth-wave crossfade aligned with the fold direction
          float diag = vUv.x * 0.72 + vUv.y * 0.28 + wC * 0.04;
          float sweep = smoothstep(diag - 0.18, diag + 0.18, uMorph * 1.36 - 0.18);
          outCol = mix(colA, colB, sweep);
        }

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

    let fileProtocolBlocked = false;
    const loadedFlags = new Array(FABRIC_WORLDS.length).fill(false);
    const imgResList = FABRIC_WORLDS.map(() => [1376, 768]);
    const textures = new Array(FABRIC_WORLDS.length).fill(null);

    function loadFabricTexture(idx) {
      if (fileProtocolBlocked || textures[idx]) return;
      const tex = gl.createTexture();
      textures[idx] = tex;

      const img = new Image();
      img.onload = () => {
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

          imgResList[idx] = [img.naturalWidth || 1376, img.naturalHeight || 768];
          loadedFlags[idx] = true;

          // Mark canvas ready only once the first real texture is uploaded cleanly
          if (idx === flowState.fabricIdx) {
            canvas.classList.add('is-ready');
          }

          // If user requested a fabric while its texture was downloading, start the smooth transition now
          if (flowState.pendingIdx === idx) {
            flowState.pendingIdx = null;
            flowState.prevIdx = flowState.fabricIdx;
            flowState.fabricIdx = idx;
            flowState.morphProg = 0.0;
          }
        } catch (_) {
          fileProtocolBlocked = true;
          canvas.classList.remove('is-ready');
        }
      };
      img.src = FABRIC_WORLDS[idx].img;
    }

    // Load initial fabric immediately, then preload the remaining 5 smoothly in background
    loadFabricTexture(0);
    setTimeout(() => {
      for (let i = 1; i < FABRIC_WORLDS.length; i++) loadFabricTexture(i);
    }, 350);

    requestTexture = (idx) => {
      if (fileProtocolBlocked) return;
      loadFabricTexture(idx);
      if (loadedFlags[idx]) {
        if (idx !== flowState.fabricIdx) {
          flowState.prevIdx = flowState.fabricIdx;
          flowState.fabricIdx = idx;
          flowState.morphProg = 0.0;
        }
        flowState.pendingIdx = null;
      } else {
        flowState.pendingIdx = idx;
      }
    };

    const uLoc = {
      texA:        gl.getUniformLocation(prog, 'uTexA'),
      texB:        gl.getUniformLocation(prog, 'uTexB'),
      res:         gl.getUniformLocation(prog, 'uRes'),
      imgResA:     gl.getUniformLocation(prog, 'uImgResA'),
      imgResB:     gl.getUniformLocation(prog, 'uImgResB'),
      morph:       gl.getUniformLocation(prog, 'uMorph'),
      time:        gl.getUniformLocation(prog, 'uTime'),
      mouse:       gl.getUniformLocation(prog, 'uMouse'),
      mouseEnergy: gl.getUniformLocation(prog, 'uMouseEnergy'),
      mode:        gl.getUniformLocation(prog, 'uMode'),
      rimCol:      gl.getUniformLocation(prog, 'uRimCol')
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

    return function renderBackground(timeSec, dt) {
      if (fileProtocolBlocked || !loadedFlags[flowState.fabricIdx]) return;
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const idxB = flowState.fabricIdx;
      const idxA = loadedFlags[flowState.prevIdx] ? flowState.prevIdx : idxB;
      const worldB = FABRIC_WORLDS[idxB];

      flowState.morphProg = Math.min(1.0, flowState.morphProg + dt * 0.95);
      curRim[0] = lerp(curRim[0], worldB.rimCol[0], 0.08);
      curRim[1] = lerp(curRim[1], worldB.rimCol[1], 0.08);
      curRim[2] = lerp(curRim[2], worldB.rimCol[2], 0.08);

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      gl.useProgram(prog);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[idxA]);
      gl.uniform1i(uLoc.texA, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[idxB]);
      gl.uniform1i(uLoc.texB, 1);

      gl.uniform2f(uLoc.res, canvas.width, canvas.height);
      gl.uniform2fv(uLoc.imgResA, imgResList[idxA]);
      gl.uniform2fv(uLoc.imgResB, imgResList[idxB]);
      gl.uniform1f(uLoc.morph, flowState.morphProg);
      gl.uniform1f(uLoc.time, timeSec);
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mouseEnergy, flowState.mouseEnergy);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform3fv(uLoc.rimCol, curRim);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  /* ==========================================================================
     UNIFIED 60FPS BACKGROUND LOOP
     ========================================================================== */
  const renderBackground = initOverheadClothWebGL();

  let lastTime = performance.now() * 0.001;
  function tick(nowMs) {
    const t = nowMs * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, t - lastTime));
    lastTime = t;

    flowState.mouseX += (flowState.targetMouseX - flowState.mouseX) * 0.08;
    flowState.mouseY += (flowState.targetMouseY - flowState.mouseY) * 0.08;
    flowState.mouseEnergy *= 0.94;

    if (renderBackground) renderBackground(t, dt);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
