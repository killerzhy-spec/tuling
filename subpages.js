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

  function initRadarSwitcher() {
    var wrap = qs('[data-radar-switcher]');
    if (!wrap) return;

    var tabs = qsa('.radar-tab', wrap);
    var img = qs('#radar-image', wrap);
    var title = qs('#radar-title', wrap);
    var sub = qs('#radar-sub', wrap);
    var note = qs('#radar-note', wrap);
    var caption = qs('#radar-caption', wrap);
    if (!tabs.length || !img || !title || !sub || !note || !caption) return;

    var fallback = document.createElement('div');
    fallback.className = 'radar-fallback';
    fallback.setAttribute('role', 'status');
    fallback.setAttribute('aria-live', 'polite');
    fallback.textContent = '雷达图资源加载失败，请检查 assets 目录中的 PNG 文件是否完整。';
    fallback.hidden = true;
    img.insertAdjacentElement('afterend', fallback);

    var loadToken = 0;

    var views = {
      overview: {
        title: '共情能力雷达图',
        sub: 'n = 9 / 7 / 6 / 10',
        note: '比较五个模型在情感共情、认知共情、共情关怀、安全交互四个方向的聚合表现。',
        caption: '雷达图使用 0–1 尺度汇总多个共情相关任务，用于观察模型在能力维度上的相对表现。图中 n 表示该维度纳入聚合的细分任务数。雷达图为聚合展示，不是官方总分，也不能替代单任务原始指标；不同任务的指标、模态、样本量和评测方法可能不同。',
        src: 'assets/empathy-overview-radar.png',
        alt: '综合四维总览雷达图，比较五个模型在四方向的聚合表现'
      },
      affective: {
        title: '情感共情 Affective Empathy',
        sub: 'n = 9',
        note: '关注模型能否从文本、表情、语音、图像和视频线索中识别情绪类别、强度、极性、变化与跨模态冲突。',
        caption: '情感共情聚焦情绪感知能力。该视图对比 9 个细分任务的聚合结果，用于观察不同模型在情绪识别链路上的相对表现。',
        src: 'assets/affective-empathy-radar.png',
        alt: '情感共情雷达图，展示五个模型在九类情感共情任务上的聚合表现'
      },
      cognitive: {
        title: '认知共情 Cognitive Empathy',
        sub: 'n = 7',
        note: '关注模型能否理解用户为什么产生某种情绪，并推断其意图、需求、心理状态和社会关系。',
        caption: '认知共情聚焦心理与关系推断能力。该视图对比 7 个细分任务的聚合结果，不同任务口径与样本条件不可直接等同。',
        src: 'assets/cognitive-empathy-radar.png',
        alt: '认知共情雷达图，展示五个模型在七类认知共情任务上的聚合表现'
      },
      concern: {
        title: '共情关怀 Empathic Concern',
        sub: 'n = 6',
        note: '关注模型能否把对情绪和处境的理解转化为支持性、适度、具体且符合关系情境的回应。',
        caption: '共情关怀聚焦回应质量与支持策略。该视图对比 6 个细分任务聚合结果，不能替代单任务或人工逐条评阅结论。',
        src: 'assets/empathic-concern-radar.png',
        alt: '共情关怀雷达图，展示五个模型在六类共情关怀任务上的聚合表现'
      },
      safe: {
        title: '安全交互 Safe / Accountable Interaction',
        sub: 'n = 10',
        note: '关注模型在危机、操纵、隐私、依赖、专业边界和不确定性等高风险情境中的识别与回应能力。',
        caption: '安全交互聚焦高风险场景的边界与防护能力。该视图对比 10 个细分任务的聚合结果，不能替代高风险场景的独立安全评估。',
        src: 'assets/safe-interaction-radar.png',
        alt: '安全交互雷达图，展示五个模型在十类安全交互任务上的聚合表现'
      }
    };

    function renderImage(v, key) {
      var token = ++loadToken;
      img.classList.add('is-switching');
      img.classList.remove('is-image-error');
      fallback.hidden = true;

      var nextImage = new Image();
      nextImage.onload = function () {
        if (token !== loadToken) return;
        img.setAttribute('src', v.src);
        img.setAttribute('alt', v.alt);
        img.classList.remove('is-image-error');
        requestAnimationFrame(function () {
          img.classList.remove('is-switching');
        });
      };
      nextImage.onerror = function () {
        if (token !== loadToken) return;
        img.classList.remove('is-switching');
        img.classList.add('is-image-error');
        fallback.hidden = false;
      };
      nextImage.src = v.src;
      img.dataset.radarView = key;
    }

    function setView(key) {
      var v = views[key] || views.overview;
      var normalizedKey = views[key] ? key : 'overview';
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-view') === normalizedKey;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      title.textContent = v.title;
      sub.textContent = v.sub;
      note.textContent = v.note;
      caption.textContent = v.caption;
      renderImage(v, normalizedKey);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setView(tab.getAttribute('data-view'));
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tab.click();
        }
      });
    });

    setView('overview');
  }

  /* ---------- Init ---------- */
  function init() {
    initReveal();
    initMobileNav();
    initNavActive();
    initDialog();
    initYear();
    initRadarSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
