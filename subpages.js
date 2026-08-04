/* ============================================================
   图灵 2.0 — Shared Subpage Logic
   subpages.js  (framework / datasets / owned / leaderboard 通用)
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- 1. Reveal on Scroll ---------- */
  function initReveal() {
    var els = qsa('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. Mobile Nav ---------- */
  function initMobileNav() {
    var toggle = qs('.nav-toggle');
    var drawer = qs('.mobile-nav');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      drawer.classList.toggle('open');
    });

    qsa('a', drawer).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
      });
    });
  }

  /* ---------- 3. Nav Active Highlight ---------- */
  function initNavActive() {
    var page = location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-links a, .mobile-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page) {
        a.classList.add('active');
      }
    });
  }

  /* ---------- 4. Submission Dialog ---------- */
  function initDialog() {
    var triggers = qsa('[data-dialog-open]');
    var dialog = qs('#submit-dialog');
    if (!dialog || !triggers.length) return;

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      });
    });

    dialog.addEventListener('click', function (e) {
      var rect = dialog.getBoundingClientRect();
      var inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                   e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) closeDialog();
    });

    var closeBtn = qs('.dialog-close', dialog);
    if (closeBtn) closeBtn.addEventListener('click', closeDialog);

    dialog.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeDialog();
    });

    function closeDialog() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }

  /* ---------- 5. Footer Year ---------- */
  function initYear() {
    qsa('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initReveal();
    initMobileNav();
    initNavActive();
    initDialog();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
