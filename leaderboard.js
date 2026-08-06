/* ============================================================
  图灵 2.0 — Leaderboard View Switcher (leaderboard.html)
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

  var MODELS = [
    { model: 'Gemini 3.1 Pro', overall: 0.5172, affective: 0.6450, cognitive: 0.4665, concern: 0.4121, safe: 0.5452 },
    { model: 'MiMo v2.5', overall: 0.4883, affective: 0.5848, cognitive: 0.4247, concern: 0.4010, safe: 0.5427 },
    { model: 'DeepSeek v4 Flash', overall: 0.4615, affective: 0.5590, cognitive: 0.3940, concern: 0.3519, safe: 0.5414 },
    { model: 'GPT-5.5', overall: 0.4486, affective: 0.4996, cognitive: 0.3933, concern: 0.3770, safe: 0.5247 },
    { model: 'Claude Opus 4.6', overall: 0.4401, affective: 0.5442, cognitive: 0.3593, concern: 0.3669, safe: 0.4898 }
  ];

  var VIEW_LABELS = {
    overall: '综合评分',
    affective: '情感共情',
    cognitive: '认知共情',
    concern: '共情关怀',
    safe: '安全交互'
  };

  function num(v) {
    return typeof v === 'number' ? v.toFixed(4) : '缺失';
  }

  function rankClass(rank) {
    if (rank === 1) return 'lb-rank lb-rank-1';
    if (rank === 2) return 'lb-rank lb-rank-2';
    if (rank === 3) return 'lb-rank lb-rank-3';
    return 'lb-rank';
  }

  function render(view) {
    var body = qs('#lb-body');
    var countEl = qs('#lb-count');
    var currentHead = qs('#lb-current-head');
    if (!body || !countEl || !currentHead) return;

    var rows = MODELS.slice().sort(function (a, b) {
      var av = typeof a[view] === 'number' ? a[view] : -Infinity;
      var bv = typeof b[view] === 'number' ? b[view] : -Infinity;
      return bv - av;
    });

    currentHead.textContent = VIEW_LABELS[view] || '综合评分';
    countEl.textContent = (VIEW_LABELS[view] || '综合评分') + '视图 · ' + rows.length + ' 个模型';

    body.innerHTML = rows.map(function (r, idx) {
      return '<tr>' +
        '<td class="' + rankClass(idx + 1) + '">' + (idx + 1) + '</td>' +
        '<td><div class="lb-model">' + r.model + '</div></td>' +
        '<td><span class="lb-score">' + num(r[view]) + '</span></td>' +
        '<td class="lb-sub">' + num(r.affective) + '</td>' +
        '<td class="lb-sub">' + num(r.cognitive) + '</td>' +
        '<td class="lb-sub">' + num(r.concern) + '</td>' +
        '<td class="lb-sub">' + num(r.safe) + '</td>' +
      '</tr>';
    }).join('');
  }

  function initViewTabs() {
    var tabs = qsa('.lb-tab');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var view = tab.getAttribute('data-view') || 'overall';
        render(view);
      });
    });

    render('overall');
  }

  function init() {
    initViewTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
