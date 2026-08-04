/* ============================================================
   图灵 2.0 — Main App Logic (index.html)
   app.js  (Demo2 复建版 · 2026-08)
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

  /* ---------- 3. Submission Dialog ---------- */
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

  /* ---------- 4. Brain Animation & Index Card ---------- */

  // EI-META 七维指标: [名称, min, max, 典型波动]
  var INDEX_METRICS = [
    ['EI-META 综合', 83.4, 89.8, 2.8],
    ['情绪感知 · P', 87.2, 94.1, 3.2],
    ['情绪理解 · U', 80.6, 90.5, 1.7],
    ['情绪表达 · E', 82.1, 91.2, 2.4],
    ['情绪调节 · R', 78.9, 88.7, 1.9],
    ['社会适应 · S', 81.5, 89.9, 2.2],
    ['安全交互 · A', 88.4, 96.8, 4.1]
  ];

  var dots = [];
  var indexCard = null;
  var currentDotIdx = -1;
  var swapTimer = null;
  var rafId = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initBrainAnimation() {
    var stage = qs('.brain-stage');
    if (!stage) return;

    indexCard = qs('.index-card');
    dots = qsa('.brain-dot, .brain-dot-purple', stage);

    if (!dots.length) return;

    if (prefersReducedMotion) {
      if (indexCard) {
        indexCard.style.left = '50%';
        indexCard.style.top = '50%';
        indexCard.style.transform = 'translate(-50%, -50%)';
        updateCardContent();
      }
      return;
    }

    currentDotIdx = Math.floor(Math.random() * dots.length);
    updateCardContent();
    startTracking();
    swapTimer = setInterval(swapIndexCard, 7000);
  }

  function startTracking() {
    var stage = qs('.brain-stage');
    if (!stage || !indexCard) return;

    var cardLeft = 0, cardTop = 0, initialized = false;

    function tick() {
      if (currentDotIdx >= 0 && currentDotIdx < dots.length) {
        var dot = dots[currentDotIdx];
        var stageRect = stage.getBoundingClientRect();
        var dotRect = dot.getBoundingClientRect();

        var x = dotRect.left - stageRect.left + dotRect.width / 2;
        var y = dotRect.top - stageRect.top + dotRect.height / 2;

        var cardW = indexCard.offsetWidth;
        var cardH = indexCard.offsetHeight;
        var offsetX = 16;
        var offsetY = -cardH - 12;

        var targetLeft = x + offsetX;
        var targetTop  = y + offsetY;

        if (targetLeft + cardW > stageRect.width)  targetLeft = x - cardW - offsetX;
        if (targetLeft < 0)                         targetLeft = 4;
        if (targetTop  < 0)                         targetTop  = y + 16;
        if (targetTop  + cardH > stageRect.height)  targetTop  = stageRect.height - cardH - 4;

        if (!initialized) {
          cardLeft = targetLeft;
          cardTop  = targetTop;
          initialized = true;
        } else {
          // lerp factor 0.025 → ~78% toward target per second at 60fps
          cardLeft += (targetLeft - cardLeft) * 0.025;
          cardTop  += (targetTop  - cardTop)  * 0.025;
        }

        indexCard.style.left = cardLeft + 'px';
        indexCard.style.top  = cardTop  + 'px';
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  function swapIndexCard() {
    if (!indexCard || prefersReducedMotion) return;

    indexCard.classList.add('swapping');

    setTimeout(function () {
      var newIdx;
      do {
        newIdx = Math.floor(Math.random() * dots.length);
      } while (newIdx === currentDotIdx && dots.length > 1);
      currentDotIdx = newIdx;

      updateCardContent();
      indexCard.classList.remove('swapping');
    }, 900);
  }

  function updateCardContent() {
    if (!indexCard) return;

    var m = INDEX_METRICS[Math.floor(Math.random() * INDEX_METRICS.length)];
    var value = (m[1] + Math.random() * (m[2] - m[1])).toFixed(1);
    var change = (Math.random() * m[3]).toFixed(1);

    var nameEl = qs('.index-card-name', indexCard);
    var valEl = qs('.index-card-value', indexCard);

    if (nameEl) nameEl.textContent = m[0];
    if (valEl) {
      valEl.innerHTML = value + '<span class="index-card-change">↑ ' + change + '</span>';
    }
  }

  /* ---------- 5. Waveform (owned preview) ---------- */
  function initWaveform() {
    var wf = qs('.waveform');
    if (!wf) return;

    var bars = 60;
    var html = '';
    for (var i = 0; i < bars; i++) {
      var h = Math.floor(6 + Math.random() * 58);
      html += '<span style="height:' + h + 'px"></span>';
    }
    wf.innerHTML = html;
  }

  /* ---------- 6. Footer Year ---------- */
  function initYear() {
    qsa('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initReveal();
    initMobileNav();
    initDialog();
    initBrainAnimation();
    initWaveform();
    initYear();
    initLangToggle();
  }

  function initLangToggle() {
    var btn = document.querySelector('.lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var opts = btn.querySelectorAll('.lang-opt');
      opts.forEach(function (opt) { opt.classList.toggle('is-active'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
