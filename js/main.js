/**
 * LOOM X — Minimal Interactive Controller
 * Navigation, smooth scroll offset, mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});

function initNavigation() {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const iconMenu = navToggle ? navToggle.querySelector('.icon-menu') : null;
  const iconClose = navToggle ? navToggle.querySelector('.icon-close') : null;

  // Add shadow to nav on scroll
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      if (iconMenu) iconMenu.style.display = isOpen ? 'none' : 'block';
      if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (iconMenu) iconMenu.style.display = 'block';
        if (iconClose) iconClose.style.display = 'none';
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}
