/**
 * Loom X (Pvt) Ltd — Site & 3D Spatial Engine
 * - Nav state on scroll + mobile menu
 * - Enquiry list: "Add to enquiry" on fabric cards syncs with the form chips
 * - Enquiry form composes a real WhatsApp / email message (no fake submit)
 * - WebGL 3D Billowing Cloth & Wave Shader in Hero (Sea Drift & Sky Breeze modes)
 * - Full-viewport 3D Floating Fiber & Current Field (#ambient-canvas)
 * - 60fps 3D Buoyant Float, Scroll-Flight Inertia & Magnetic 3D Card Tilt
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Global 3D Flow State ---------- */
  const flowState = {
    mode: 'sea', // 'sea' | 'sky'
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

  /* ---------- Flow Mode Switcher (Sea Drift / Sky Breeze) ---------- */
  const flowPill = $('.flow-pill');
  const flowBtns = $$('.flow-pill__btn');
  flowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.flowMode || 'sea';
      flowState.mode = mode;
      if (flowPill) flowPill.dataset.mode = mode;
      flowBtns.forEach(b => b.classList.toggle('is-active', b === btn));
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
     1. POINTER & SCROLL VELOCITY TRACKER
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
     2. WEBGL 3D BILLOWING CLOTH & SEA/SKY SHADER IN HERO
     ========================================================================== */
  function initHeroWebGL3D() {
    const canvas = $('#hero-canvas');
    const heroImg = $('#hero-img');
    if (!canvas || !heroImg) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'high-performance' });
    if (!gl) return;

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
      uniform sampler2D uTex;
      uniform float uTime;
      uniform vec2 uRes;
      uniform vec2 uImgSize;
      uniform vec2 uMouse;
      uniform float uRipple;
      uniform float uMode; // 0.0 = sea drift, 1.0 = sky breeze

      // Object-fit cover UV with 70% horizontal anchor
      vec2 coverUv(vec2 uv, vec2 s, vec2 i) {
        float rs = s.x / max(1.0, s.y);
        float ri = i.x / max(1.0, i.y);
        vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
        vec2 offset = (rs < ri ? vec2((newSize.x - s.x) * 0.7, 0.0) : vec2(0.0, (newSize.y - s.y) * 0.5)) / newSize;
        return uv * (s / newSize) + offset;
      }

      // 3D wave height field (simulates fabric billowing in sea swells or sky currents)
      float waveHeight(vec2 p, float t) {
        float speed = mix(0.85, 1.45, uMode);
        float w1 = sin(p.x * 4.2 + p.y * 2.8 - t * speed) * 0.45;
        float w2 = cos(p.x * 2.4 - p.y * 5.1 + t * speed * 0.78) * 0.35;
        float w3 = sin((p.x + p.y) * 8.5 - t * speed * 1.35) * 0.20;

        // Cursor 3D ripple wake
        vec2 d = p - uMouse;
        d.x *= uRes.x / max(1.0, uRes.y);
        float dist = length(d);
        float wake = sin(dist * 24.0 - t * 4.5) * exp(-dist * 4.8) * (0.45 + uRipple * 1.4);

        return (w1 + w2 + w3) * mix(1.0, 1.25, uMode) + wake;
      }

      void main() {
        vec2 uv = coverUv(vUv, uRes, uImgSize);

        // Compute 3D height and surface normal via finite differences
        float eps = 0.004;
        float hC = waveHeight(vUv, uTime);
        float hX = waveHeight(vUv + vec2(eps, 0.0), uTime) - hC;
        float hY = waveHeight(vUv + vec2(0.0, eps), uTime) - hC;
        vec3 normal = normalize(vec3(-hX * 2.8, -hY * 2.8, 1.0));

        // Displace UV in 3D perspective to make the cloth folds billow & breathe
        float amp = mix(0.014, 0.019, uMode);
        vec2 displacedUv = clamp(uv + normal.xy * amp + vec2(hC * 0.005, -hC * 0.004), 0.002, 0.998);

        vec3 texCol = texture2D(uTex, displacedUv).rgb;

        // Anisotropic velvet/plush rim lighting & depth shading
        vec3 lightDir1 = normalize(vec3(0.5, -0.4, 0.75));
        vec3 lightDir2 = normalize(vec3(-0.6, 0.5, 0.5));
        float diff = dot(normal, lightDir1);
        float rim = pow(clamp(1.0 - normal.z, 0.0, 1.0), 1.6);

        // Sea Drift gives cool moonlit cyan/pearl sheen; Sky Breeze gives warm vermilion/sunset lift
        vec3 seaTint = vec3(0.55, 0.82, 0.98);
        vec3 skyTint = vec3(1.0, 0.42, 0.25);
        vec3 accentLight = mix(seaTint, skyTint, uMode);

        // Subtle 3D cloth shadow in troughs + plush sheen on crests
        vec3 shaded = texCol * (0.94 + 0.14 * diff);
        shaded += accentLight * (rim * 0.24 + max(0.0, hC) * 0.055);
        shaded += vec3(1.0, 0.96, 0.92) * pow(max(0.0, dot(normal, lightDir2)), 6.0) * 0.09;

        gl_FragColor = vec4(shaded, 1.0);
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
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uImgSize = gl.getUniformLocation(prog, 'uImgSize');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uRipple = gl.getUniformLocation(prog, 'uRipple');
    const uMode = gl.getUniformLocation(prog, 'uMode');

    const tex = gl.createTexture();
    let ready = false;
    let modeVal = 0;

    function uploadTexture() {
      if (ready || !heroImg.complete || !heroImg.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heroImg);
      ready = true;
      canvas.classList.add('is-ready');
    }

    if (heroImg.complete && heroImg.naturalWidth) uploadTexture();
    else heroImg.addEventListener('load', uploadTexture, { once: true });

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

    return function renderHero(timeSec) {
      if (!ready) return;
      // Only render when hero is near viewport
      if (flowState.scrollY > window.innerHeight * 1.3) return;

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal += (targetMode - modeVal) * 0.05;
      const ripple = Math.min(1.5, Math.hypot(flowState.mouseVelX, flowState.mouseVelY) * 18);

      gl.uniform1f(uTime, timeSec);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uImgSize, heroImg.naturalWidth || 1600, heroImg.naturalHeight || 900);
      gl.uniform2f(uMouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uRipple, ripple);
      gl.uniform1f(uMode, modeVal);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

    // 3D particles & gossamer textile fibers at varying Z-depths (0.2 = far, 1.0 = near)
    const COUNT = 38;
    const motes = Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: 0.2 + (i / COUNT) * 0.8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.7,
      phase: Math.random() * Math.PI * 2,
      len: 10 + Math.random() * 20,
      hueType: i % 3 // 0: warm cream, 1: vermilion accent, 2: soft sky/pearl
    }));

    return function renderAmbient(t) {
      ctx.clearRect(0, 0, w, h);
      const isSky = flowState.mode === 'sky';
      const windX = (flowState.mouseX - 0.5) * (isSky ? 1.4 : 0.7);
      const scrollBoost = flowState.scrollVel * 0.32;

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const depth = m.z;

        // Sea Drift: slow rolling horizontal & vertical sinusoidal swell
        // Sky Breeze: uplifting diagonal flight + stronger wind response
        const vx = isSky
          ? (0.45 + Math.sin(t * 0.7 + m.phase) * 0.35 + windX * 1.6) * depth
          : (Math.sin(t * 0.55 + m.phase) * 0.48 + windX * 0.9) * depth;

        const vy = isSky
          ? (-0.42 + Math.cos(t * 0.8 + m.phase) * 0.25) * depth - scrollBoost * depth
          : (-0.18 + Math.sin(t * 0.65 + m.phase * 1.3) * 0.32) * depth - scrollBoost * depth * 0.7;

        m.x += vx;
        m.y += vy;
        m.angle += m.spin * 0.012 + (isSky ? 0.008 : 0.004) * Math.sin(t + m.phase);

        // Wrap seamlessly around viewport edges
        if (m.x < -40) m.x = w + 40;
        if (m.x > w + 40) m.x = -40;
        if (m.y < -40) m.y = h + 40;
        if (m.y > h + 40) m.y = -40;

        // Draw curved 3D floating textile fiber / luminous mote
        const alpha = (0.14 + depth * 0.22) * (0.75 + 0.25 * Math.sin(t * 1.4 + m.phase));
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);

        const len = m.len * depth;
        const bow = Math.sin(t * 1.8 + m.phase) * (5 * depth);

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

        ctx.lineWidth = Math.max(1, 1.8 * depth);
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

    // Bind interactive 3D pointer tilt on each card
    floatItems.forEach(item => {
      const { el } = item;
      el.addEventListener('pointerenter', () => {
        item.hovered = true;
        el.classList.add('is-hovered');
      });

      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top) / rect.height;   // 0..1
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

      // 3D parallax & gentle tilt on hero typography
      if (heroContent && flowState.scrollY < window.innerHeight) {
        const hx = (flowState.mouseX - 0.5) * -18;
        const hy = (flowState.mouseY - 0.5) * -14 + Math.sin(t * freq) * 6;
        const hrx = (0.5 - flowState.mouseY) * 4.5 + Math.cos(t * 0.8) * 1.2;
        const hry = (flowState.mouseX - 0.5) * 5.5 + Math.sin(t * 0.7) * 1.4;
        heroContent.style.setProperty('--hx', `${hx.toFixed(2)}px`);
        heroContent.style.setProperty('--hy', `${hy.toFixed(2)}px`);
        heroContent.style.setProperty('--hrx', `${hrx.toFixed(2)}deg`);
        heroContent.style.setProperty('--hry', `${hry.toFixed(2)}deg`);
      }

      // Scroll-velocity 3D pitch ("flying in the sky / diving in the sea" inertia)
      const scrollPitch = Math.max(-7, Math.min(7, flowState.scrollVel * 0.18));
      const scrollLift = Math.max(-18, Math.min(18, -flowState.scrollVel * 0.35));

      for (let i = 0; i < floatItems.length; i++) {
        const it = floatItems[i];
        // Continuous 3D buoyancy wave
        const waveY = Math.sin(t * freq + it.phase) * it.ampY + scrollLift;
        const waveRx = Math.cos(t * (freq * 0.85) + it.phase) * it.ampR;
        const waveRy = Math.sin(t * (freq * 0.75) + it.phase * 1.3) * it.ampR;

        // Smoothly interpolate interactive 3D tilt + buoyancy + scroll flight pitch
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
  const renderHero = initHeroWebGL3D();
  const renderAmbient = initAmbient3DField();
  const updateSpatial3D = initSpatial3DCards();

  function tick(nowMs) {
    const t = nowMs * 0.001;

    // Smooth pointer & scroll velocity decay
    flowState.mouseX += (flowState.targetMouseX - flowState.mouseX) * 0.08;
    flowState.mouseY += (flowState.targetMouseY - flowState.mouseY) * 0.08;
    flowState.mouseVelX *= 0.9;
    flowState.mouseVelY *= 0.9;

    const currentScroll = window.scrollY;
    const rawDelta = currentScroll - flowState.scrollY;
    flowState.scrollY = currentScroll;
    flowState.scrollVel += (rawDelta - flowState.scrollVel) * 0.15;
    flowState.scrollVel *= 0.92;

    if (renderHero) renderHero(t);
    if (renderAmbient) renderAmbient(t);
    if (updateSpatial3D) updateSpatial3D(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
