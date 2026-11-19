/**
 * Loom X (Pvt) Ltd — Site & Overhead PV Plush Background Wave Engine
 * - Nav state on scroll + mobile menu
 * - Enquiry list: "Add to enquiry" on fabric cards syncs with the form chips
 * - Enquiry form composes a real WhatsApp / email message (no fake submit)
 * - Reveal on scroll
 * - Background-only WebGL cloth ripple & lighting animation on the
 *   overhead PV Plush hero photo (zero floating text or moving cards)
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';
  const HERO_FABRIC = {
    img: 'assets/images/bg-pv-plush.jpg',
    rimCol: [1.00, 0.80, 0.86]
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Background Flow State ---------- */
  const flowState = {
    mode: 'sea', // 'sea' (Gentle Wave) | 'sky' (Breeze Drift)
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
     WEBGL OVERHEAD PV PLUSH CLOTH WAVE & LIGHTING BACKGROUND (#hero-canvas)
     - Uses true cover-fit UV mapping so the 16:9 PV Plush photo never stretches
     - Animates only the background cloth with smooth undulating folds and
       synchronized raking velvet sheen across the real macro pile texture
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

      uniform sampler2D uTex;
      uniform vec2 uRes;
      uniform vec2 uImgRes;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseEnergy;
      uniform float uMode; // 0 = gentle wave, 1 = breeze drift
      uniform vec3 uRimCol;

      vec2 coverUv(vec2 uv, vec2 res, vec2 imgRes) {
        float rs = res.x / max(1.0, res.y);
        float ri = imgRes.x / max(1.0, imgRes.y);
        vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
        return (uv - 0.5) * scale * 0.94 + 0.5;
      }

      float clothWave(vec2 uv, float t) {
        float aspect = uRes.x / max(1.0, uRes.y);
        vec2 p = vec2(uv.x * aspect, uv.y);

        float speed = mix(0.65, 1.15, uMode);
        float amp   = mix(1.0, 1.35, uMode);

        float w1 = sin(p.x * 2.6 + p.y * 1.9 - t * speed) * 0.50;
        float w2 = cos(p.x * 1.7 - p.y * 2.8 + t * speed * 0.78) * 0.34;
        float w3 = sin((p.x + p.y) * 4.2 - t * speed * 1.25) * 0.16;

        vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
        float dist = length(p - mp);
        float cursorRipple = sin(dist * 16.0 - t * 4.0) * exp(-dist * 4.5) * (0.28 * uMouseEnergy);

        return (w1 + w2 + w3) * amp + cursorRipple;
      }

      void main() {
        float eps = 0.006;
        float wC = clothWave(vUv, uTime);
        float wX = (clothWave(vUv + vec2(eps, 0.0), uTime) - wC) / eps;
        float wY = (clothWave(vUv + vec2(0.0, eps), uTime) - wC) / eps;
        vec2 waveGrad = vec2(wX, wY);

        vec2 disp = -waveGrad * 0.0032;
        vec2 baseUv = clamp(coverUv(vUv, uRes, uImgRes) + disp, 0.004, 0.996);
        vec3 col = texture2D(uTex, baseUv).rgb;

        float texEps = 0.0022;
        float lC = dot(col, vec3(0.333));
        float lX = dot(texture2D(uTex, clamp(baseUv + vec2(texEps, 0.0), 0.004, 0.996)).rgb, vec3(0.333)) - lC;
        float lY = dot(texture2D(uTex, clamp(baseUv + vec2(0.0, texEps), 0.004, 0.996)).rgb, vec3(0.333)) - lC;

        vec3 n = normalize(vec3(
          -waveGrad.x * 0.22 - lX * 1.35,
          -waveGrad.y * 0.22 - lY * 1.35,
          1.0
        ));

        vec3 lightDir = normalize(vec3(0.45 + 0.12 * sin(uTime * 0.4), -0.45 + 0.10 * cos(uTime * 0.35), 0.76));
        float diff = max(0.0, dot(n, lightDir));
        float wrapDiff = 0.80 + 0.34 * diff;
        float rimSheen = pow(clamp(1.0 - n.z, 0.0, 1.0), 1.8);

        vec3 lit = col * wrapDiff;
        lit += uRimCol * rimSheen * (0.10 + 0.12 * lC);

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

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    let textureReady = false;
    let fileProtocolBlocked = false;
    let imgRes = [1376, 768];
    const tex = gl.createTexture();

    const img = new Image();
    img.onload = () => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        imgRes = [img.naturalWidth || 1376, img.naturalHeight || 768];
        textureReady = true;
        canvas.classList.add('is-ready');
      } catch (_) {
        fileProtocolBlocked = true;
        canvas.classList.remove('is-ready');
      }
    };
    img.src = HERO_FABRIC.img;

    const uLoc = {
      tex:         gl.getUniformLocation(prog, 'uTex'),
      res:         gl.getUniformLocation(prog, 'uRes'),
      imgRes:      gl.getUniformLocation(prog, 'uImgRes'),
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

    let modeVal = 0;
    const lerp = (a, b, k) => a + (b - a) * k;

    return function renderBackground(timeSec) {
      if (fileProtocolBlocked || !textureReady) return;
      if (flowState.scrollY > window.innerHeight * 1.35) return;

      const targetMode = flowState.mode === 'sky' ? 1.0 : 0.0;
      modeVal = lerp(modeVal, targetMode, 0.05);

      gl.useProgram(prog);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uLoc.tex, 0);

      gl.uniform2f(uLoc.res, canvas.width, canvas.height);
      gl.uniform2fv(uLoc.imgRes, imgRes);
      gl.uniform1f(uLoc.time, timeSec);
      gl.uniform2f(uLoc.mouse, flowState.mouseX, flowState.mouseY);
      gl.uniform1f(uLoc.mouseEnergy, flowState.mouseEnergy);
      gl.uniform1f(uLoc.mode, modeVal);
      gl.uniform3fv(uLoc.rimCol, HERO_FABRIC.rimCol);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  /* ==========================================================================
     UNIFIED 60FPS BACKGROUND LOOP
     ========================================================================== */
  const renderBackground = initOverheadClothWebGL();

  function tick(nowMs) {
    const t = nowMs * 0.001;

    flowState.mouseX += (flowState.targetMouseX - flowState.mouseX) * 0.08;
    flowState.mouseY += (flowState.targetMouseY - flowState.mouseY) * 0.08;
    flowState.mouseEnergy *= 0.94;

    if (renderBackground) renderBackground(t);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
