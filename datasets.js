/* ============================================================
   图灵 2.0 — Dataset Browser (datasets.html)
   datasets.js  · 193 条目 × 24 字段客户端渲染
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var DATA = window.TURING_DATA;
  if (!DATA) return;

  var SECTION_ORDER = ['摘要', '任务适配理由', '数据规模', '获取方式', '标注信息',
    '内容字段', '数据处理', '使用说明', '评测指标', '榜单信息',
    '许可证', '验证信息', '维护信息', '版本信息'];

  var state = {
    catId: DATA.categories[0].id,
    subtask: '',   // '' = 全部
    query: ''
  };

  /* ---------- 预处理：搜索串 ---------- */
  function stripHtml(s) {
    return (s || '').replace(/<[^>]+>/g, ' ');
  }

  DATA.categories.forEach(function (cat) {
    cat.subtasks.forEach(function (st) {
      st.entries.forEach(function (e) {
        e._cat = cat.name;
        e._catId = cat.id;
        e._subtask = st.name;
        e._search = [
          e.name, e.title, e.en, e.year, e.modality, e.language,
          e.access, st.name, cat.name,
          stripHtml(e.sections['摘要']),
          stripHtml(e.sections['任务适配理由'])
        ].join(' ').toLowerCase();
      });
    });
  });

  function allEntries() {
    var out = [];
    DATA.categories.forEach(function (cat) {
      cat.subtasks.forEach(function (st) {
        st.entries.forEach(function (e) { out.push(e); });
      });
    });
    return out;
  }

  /* ---------- 访问状态标签样式 ---------- */
  function accessClass(access) {
    if (/公开/.test(access)) return 'ds-tag-access';
    if (/申请/.test(access)) return 'ds-tag-access apply';
    return 'ds-tag-access unknown';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 渲染：大类统计卡 ---------- */
  function renderCatStats() {
    var wrap = qs('#cat-stats');
    if (!wrap) return;
    var max = Math.max.apply(null, DATA.categories.map(function (c) { return c.count; }));
    wrap.innerHTML = DATA.categories.map(function (cat) {
      var tasks = cat.subtasks.length;
      var pct = Math.round(cat.count / max * 100);
      return '<div class="cat-stat' + (cat.id === state.catId ? ' active' : '') +
        '" data-cat="' + cat.id + '" role="button" tabindex="0">' +
        '<div class="cat-stat-name">' + cat.name +
        '<span class="cat-stat-count">' + cat.count + '</span></div>' +
        '<div class="cat-stat-bar"><div class="cat-stat-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cat-stat-sub">' + tasks + ' 个细分任务</div>' +
        '</div>';
    }).join('');

    qsa('.cat-stat', wrap).forEach(function (el) {
      function pick() {
        state.catId = el.getAttribute('data-cat');
        state.subtask = '';
        renderCatStats();
        renderChips();
        renderList();
      }
      el.addEventListener('click', pick);
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); }
      });
    });
  }

  /* ---------- 渲染：细分任务 chips ---------- */
  function currentCat() {
    return DATA.categories.filter(function (c) { return c.id === state.catId; })[0];
  }

  function renderChips() {
    var wrap = qs('#subtask-chips');
    if (!wrap) return;
    var cat = currentCat();
    var chips = ['<button class="subtask-chip' + (state.subtask === '' ? ' active' : '') +
      '" data-sub="">全部 <span class="chip-n">' + cat.count + '</span></button>'];
    cat.subtasks.forEach(function (st) {
      chips.push('<button class="subtask-chip' + (state.subtask === st.name ? ' active' : '') +
        '" data-sub="' + escapeHtml(st.name) + '">' + escapeHtml(st.name) +
        ' <span class="chip-n">' + st.entries.length + '</span></button>');
    });
    wrap.innerHTML = chips.join('');

    qsa('.subtask-chip', wrap).forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.subtask = chip.getAttribute('data-sub');
        renderChips();
        renderList();
      });
    });
  }

  /* ---------- 渲染：条目列表 ---------- */
  function filterEntries() {
    var q = state.query.trim().toLowerCase();
    return allEntries().filter(function (e) {
      if (state.catId && e._catId !== state.catId) return false;
      if (state.subtask && e._subtask !== state.subtask) return false;
      if (q && e._search.indexOf(q) === -1) return false;
      return true;
    });
  }

  function entryHeadHtml(e, idx) {
    var yearTag = e.year && !/暂未提供/.test(e.year)
      ? '<span class="entry-year">' + escapeHtml(e.year) + '</span>' : '';
    var modality = e.modality && !/暂未提供/.test(e.modality) ? e.modality : '模态见详情';
    return '<button class="entry-head" aria-expanded="false">' +
      '<span class="entry-idx">' + (idx + 1) + '</span>' +
      '<div class="entry-main">' +
      '<div class="entry-name">' + escapeHtml(e.name) + yearTag + '</div>' +
      '<div class="entry-sub">' +
      '<span><b>' + escapeHtml(e._subtask) + '</b></span>' +
      '<span>' + escapeHtml(modality.length > 42 ? modality.slice(0, 42) + '…' : modality) + '</span>' +
      '</div></div>' +
      '<div class="entry-tags">' +
      '<span class="ds-tag ds-tag-' + e._catId + '">' + e._cat + '</span>' +
      '<span class="' + accessClass(e.access) + '">' + escapeHtml(e.access) + '</span>' +
      '</div>' +
      '<span class="entry-chevron"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '</button>';
  }

  function entryBodyHtml(e) {
    var meta = [
      ['英文名称', escapeHtml(e.en)],
      ['条目编号', e.entryId ? '<code>' + escapeHtml(e.entryId) + '</code>' : ''],
      ['数据集编号', e.datasetId ? '<code>' + escapeHtml(e.datasetId) + '</code>' : ''],
      ['年份', escapeHtml(e.year)],
      ['语言', escapeHtml(e.language)],
      ['官方链接', e.link && /^https?:/.test(e.link)
        ? '<a href="' + escapeHtml(e.link) + '" target="_blank" rel="noopener">' + escapeHtml(e.link) + ' ↗</a>'
        : escapeHtml(e.link)]
    ].filter(function (m) { return m[1]; });

    var html = '<div class="entry-meta-grid">' + meta.map(function (m) {
      return '<div class="entry-meta-item"><b>' + m[0] + '</b>' + m[1] + '</div>';
    }).join('') + '</div>';

    SECTION_ORDER.forEach(function (key) {
      var content = e.sections[key];
      if (content && content.trim()) {
        html += '<div class="entry-section">' +
          '<div class="entry-section-label">' + key + '</div>' +
          '<div class="entry-section-content">' + content + '</div></div>';
      }
    });
    return html;
  }

  function renderList() {
    var list = qs('#entry-list');
    var counter = qs('#result-count');
    if (!list) return;

    var entries = filterEntries();

    if (counter) {
      var cat = currentCat();
      counter.textContent = '当前筛选：' + cat.name +
        (state.subtask ? ' · ' + state.subtask : '') +
        ' — 共 ' + entries.length + ' 条评测条目';
    }

    if (!entries.length) {
      list.innerHTML = '<div class="no-results">未找到匹配的数据集，请调整搜索或筛选条件</div>';
      return;
    }

    list.innerHTML = entries.map(function (e, i) {
      return '<div class="entry-card">' + entryHeadHtml(e, i) +
        '<div class="entry-body"></div></div>';
    }).join('');

    qsa('.entry-card', list).forEach(function (card, i) {
      var head = qs('.entry-head', card);
      var body = qs('.entry-body', card);
      head.addEventListener('click', function () {
        var open = card.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        // 懒渲染：首次展开才注入详情
        if (open && !body.getAttribute('data-rendered')) {
          body.innerHTML = entryBodyHtml(entries[i]);
          body.setAttribute('data-rendered', '1');
        }
      });
    });
  }

  /* ---------- 搜索 ---------- */
  function initSearch() {
    var input = qs('#dataset-search');
    if (!input) return;
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.query = input.value;
        renderList();
      }, 180);
    });
  }

  /* ---------- Init ---------- */
  function init() {
    renderCatStats();
    renderChips();
    renderList();
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
