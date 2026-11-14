/**
 * Loom X (Pvt) Ltd — site interactions
 * - Nav state on scroll + mobile menu
 * - Enquiry list: "Add to enquiry" on fabric cards syncs with the form chips
 * - Enquiry form composes a real WhatsApp / email message (no fake submit)
 * - Scroll reveal
 */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '94773374429';
  const EMAIL = 'loomxlk@gmail.com';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

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
    void countEl.offsetWidth; // restart animation
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
    // Stagger siblings inside grids
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
})();
