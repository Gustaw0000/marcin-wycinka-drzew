(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.querySelector('.site-header');
  if (header) {
    var setShadow = function () {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    setShadow();
    window.addEventListener('scroll', setShadow, { passive: true });
  }

  if (!prefersReduced) {
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
        history.replaceState(null, '', href);
      });
    });
  }

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var reveals = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
})();
