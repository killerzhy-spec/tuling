/* ============================================================
   图灵 2.0 — Leaderboard Track Filter (leaderboard.html)
   leaderboard.js
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function initTrackFilter() {
    var tabs = qsa('.lb-tab');
    var rows = qsa('.lb-table tbody tr');
    var countEl = qs('#lb-count');
    if (!tabs.length || !rows.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var track = tab.getAttribute('data-track');
        var shown = 0;
        rows.forEach(function (row) {
          var match = track === 'all' || row.getAttribute('data-track') === track;
          row.style.display = match ? '' : 'none';
          if (match) shown++;
        });

        if (countEl) {
          countEl.textContent = track === 'all'
            ? '综合榜单 · 全部赛道 · 10 个模型'
            : '赛道 ' + track + ' · ' + shown + ' 个模型';
        }
      });
    });
  }

  /* 进度条动画：进入视口后填充 */
  function initProgress() {
    var fills = qsa('.lb-progress-fill');
    if (!fills.length) return;
    if (!('IntersectionObserver' in window)) {
      fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var f = entry.target;
          f.style.width = f.getAttribute('data-w') + '%';
          io.unobserve(f);
        }
      });
    }, { threshold: 0.3 });
    fills.forEach(function (f) { io.observe(f); });
  }

  function init() {
    initTrackFilter();
    initProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
