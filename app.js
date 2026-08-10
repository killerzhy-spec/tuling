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

  // 四方向指标卡: [名称, min, max, 典型波动]
  var INDEX_METRICS = [
    ['Affective Empathy', 0.54, 0.65, 0.04],
    ['Cognitive Empathy', 0.36, 0.47, 0.03],
    ['Empathic Concern', 0.35, 0.42, 0.03],
    ['Safe Interaction', 0.49, 0.55, 0.02]
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
    var value = (m[1] + Math.random() * (m[2] - m[1])).toFixed(4);
    var change = (Math.random() * m[3]).toFixed(2);

    var nameEl = qs('.index-card-name', indexCard);
    var valEl = qs('.index-card-value', indexCard);

    if (nameEl) nameEl.textContent = m[0];
    if (valEl) {
      valEl.innerHTML = value + '<span class="index-card-change">↑ ' + change + '</span>';
    }
  }

  function initRadarSwitcher() {
    var wrap = qs('[data-radar-switcher]');
    if (!wrap) return;

    var tabs = qsa('.radar-tab', wrap);
    var cards = qsa('[data-radar-view]');
    var img = qs('#radar-image', wrap);
    var title = qs('#radar-title', wrap);
    var sub = qs('#radar-sub', wrap);
    var note = qs('#radar-note', wrap);
    if (!tabs.length || !img || !title || !sub || !note) return;

    var fallback = document.createElement('div');
    fallback.className = 'radar-fallback';
    fallback.setAttribute('role', 'status');
    fallback.setAttribute('aria-live', 'polite');
    fallback.textContent = '雷达图资源加载失败，请检查 assets 目录中的 PNG 文件是否完整。';
    fallback.hidden = true;
    img.insertAdjacentElement('afterend', fallback);

    var views = {
      overview: {
        title: '共情能力雷达图',
        sub: 'n = 9 / 7 / 6 / 10',
        note: '比较五个模型在情感共情、认知共情、共情关怀、安全交互四个方向的聚合表现。',
        src: 'assets/empathy-overview-radar.png',
        alt: '综合四维总览雷达图，比较五个模型在四方向的聚合表现'
      },
      affective: {
        title: '情感共情 Affective Empathy',
        sub: 'n = 9',
        note: '关注模型能否从文本、表情、语音、图像和视频线索中识别情绪类别、强度、极性、变化与跨模态冲突。',
        src: 'assets/affective-empathy-radar.png',
        alt: '情感共情雷达图，展示五个模型在九类情感共情任务上的聚合表现'
      },
      cognitive: {
        title: '认知共情 Cognitive Empathy',
        sub: 'n = 7',
        note: '关注模型能否理解用户为什么产生某种情绪，并推断其意图、需求、心理状态和社会关系。',
        src: 'assets/cognitive-empathy-radar.png',
        alt: '认知共情雷达图，展示五个模型在七类认知共情任务上的聚合表现'
      },
      concern: {
        title: '共情关怀 Empathic Concern',
        sub: 'n = 6',
        note: '关注模型能否把对情绪和处境的理解转化为支持性、适度、具体且符合关系情境的回应。',
        src: 'assets/empathic-concern-radar.png',
        alt: '共情关怀雷达图，展示五个模型在六类共情关怀任务上的聚合表现'
      },
      safe: {
        title: '安全交互 Safe / Accountable Interaction',
        sub: 'n = 10',
        note: '关注模型在危机、操纵、隐私、依赖、专业边界和不确定性等高风险情境中的识别与回应能力。',
        src: 'assets/safe-interaction-radar.png',
        alt: '安全交互雷达图，展示五个模型在十类安全交互任务上的聚合表现'
      }
    };

    function setView(key) {
      var v = views[key] || views.overview;
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-view') === key;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var isActive = card.getAttribute('data-radar-view') === key;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      title.textContent = v.title;
      sub.textContent = v.sub;
      note.textContent = v.note;
      fallback.hidden = true;
      img.hidden = false;
      img.setAttribute('src', v.src);
      img.setAttribute('alt', v.alt);
    }

    function focusView(key) {
      var targetTab = tabs.filter(function (tab) {
        return tab.getAttribute('data-view') === key;
      })[0];
      setView(key);
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (targetTab) targetTab.focus({ preventScroll: true });
    }

    img.addEventListener('error', function () {
      img.hidden = true;
      fallback.hidden = false;
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setView(tab.getAttribute('data-view'));
      });
    });

    wrap._setRadarView = focusView;
    setView('overview');
  }

  function initRadarCards() {
    var wrap = qs('[data-radar-switcher]');
    var cards = qsa('[data-radar-view]');
    if (!wrap || !cards.length || typeof wrap._setRadarView !== 'function') return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        wrap._setRadarView(card.getAttribute('data-radar-view'));
      });
    });
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
    initRadarSwitcher();
    initRadarCards();
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
