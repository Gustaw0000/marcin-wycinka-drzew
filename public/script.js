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

  var form = document.getElementById('zgloszenie');
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var phone = form.querySelector('a[href^="tel:"]') ? form.querySelector('a[href^="tel:"]').textContent : '';
    var setStatus = function (text, cls) {
      if (!status) return;
      status.textContent = text;
      status.className = 'form-status ' + (cls || '');
    };
    form.addEventListener('submit', function (event) {
      if (typeof fetch !== 'function' || typeof FormData !== 'function') return;
      event.preventDefault();
      var data = new FormData(form);
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Wysyłam...'; }
      setStatus('Wysyłam zgłoszenie, chwila.', 'is-pending');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        return res.json().then(function (json) { return { ok: res.ok, json: json }; });
      }).then(function (out) {
        if (out.ok && out.json && out.json.success) {
          setStatus('Dzięki, zgłoszenie poszło. Oddzwonię najpóźniej tego samego wieczora.', 'is-ok');
          form.reset();
        } else {
          var msg = (out.json && out.json.message) ? out.json.message : 'Nie udało się wysłać.';
          setStatus('Coś poszło nie tak: ' + msg + ' Zadzwoń bezpośrednio na podany numer.', 'is-err');
        }
      }).catch(function () {
        setStatus('Brak połączenia z serwerem formularza. Zadzwoń bezpośrednio na podany numer.', 'is-err');
      }).then(function () {
        if (submit) { submit.disabled = false; if (submit.dataset.label) submit.textContent = submit.dataset.label; }
      });
    });
  }
})();
