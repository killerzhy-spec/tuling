(function () {
  'use strict';

  var pageKey = 'turing-comments:' + location.pathname.replace(/\/+$/, '');
  var state = {
    comments: loadComments(),
    placing: false,
    activeId: null,
    draft: null
  };

  var layer;
  var toggle;
  var panel;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadComments() {
    try {
      var saved = JSON.parse(localStorage.getItem(pageKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveComments() {
    localStorage.setItem(pageKey, JSON.stringify(state.comments));
  }

  function formatTime(timestamp) {
    var date = new Date(timestamp);
    var today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  }

  function icon(name) {
    var icons = {
      comment: '<path d="M5 5.8A2.8 2.8 0 0 1 7.8 3h8.4A2.8 2.8 0 0 1 19 5.8v5.4a2.8 2.8 0 0 1-2.8 2.8h-5.7L6 18v-4.3a2.8 2.8 0 0 1-1-2.1V5.8Z"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      trash: '<path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5"/>',
      send: '<path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>';
  }

  function init() {
    layer = document.createElement('div');
    layer.className = 'comment-layer';
    layer.setAttribute('aria-live', 'polite');

    toggle = document.createElement('button');
    toggle.className = 'comment-toggle';
    toggle.type = 'button';
    toggle.title = '反馈留言';
    toggle.setAttribute('aria-label', '开启反馈留言模式');
    toggle.innerHTML = icon('comment') + '<span class="comment-badge"></span>';

    panel = document.createElement('aside');
    panel.className = 'comment-panel';
    panel.setAttribute('aria-label', '反馈留言');

    document.body.appendChild(layer);
    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    toggle.addEventListener('click', function () {
      if (state.activeId || state.draft) {
        closePanel();
      } else {
        setPlacing(!state.placing);
      }
    });

    document.addEventListener('click', handlePageClick, true);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closePanel();
    });

    renderPins();
  }

  function setPlacing(enabled) {
    state.placing = enabled;
    document.body.classList.toggle('comment-placing', enabled);
    toggle.classList.toggle('active', enabled);
    toggle.setAttribute('aria-label', enabled ? '退出反馈留言模式' : '开启反馈留言模式');
    toggle.innerHTML = icon(enabled ? 'close' : 'comment') + '<span class="comment-badge"></span>';
    updateBadge();
  }

  function handlePageClick(event) {
    if (!state.placing || event.target.closest('.comment-toggle, .comment-panel, .comment-pin')) return;
    if (event.target.closest('a, button, input, textarea, select, dialog')) return;

    event.preventDefault();
    event.stopPropagation();
    state.draft = {
      x: Math.max(16, Math.min(document.documentElement.scrollWidth - 16, event.pageX)),
      y: Math.max(16, event.pageY)
    };
    state.activeId = null;
    setPlacing(false);
    renderPins();
    renderPanel();
  }

  function renderPins() {
    var visible = state.comments.filter(function (comment) { return !comment.resolved; });
    layer.innerHTML = visible.map(function (comment) {
      var index = state.comments.indexOf(comment) + 1;
      return '<button class="comment-pin' + (state.activeId === comment.id ? ' active' : '') +
        '" type="button" data-comment-id="' + comment.id + '" style="left:' + comment.x + 'px;top:' + comment.y + 'px"' +
        ' aria-label="查看第 ' + index + ' 条反馈">' + index + '</button>';
    }).join('');

    if (state.draft) {
      layer.innerHTML += '<span class="comment-pin comment-pin-draft" style="left:' + state.draft.x +
        'px;top:' + state.draft.y + 'px">+</span>';
    }

    Array.prototype.slice.call(layer.querySelectorAll('[data-comment-id]')).forEach(function (pin) {
      pin.addEventListener('click', function (event) {
        event.stopPropagation();
        state.activeId = pin.getAttribute('data-comment-id');
        state.draft = null;
        setPlacing(false);
        renderPins();
        renderPanel();
      });
    });
    updateBadge();
  }

  function updateBadge() {
    var badge = toggle && toggle.querySelector('.comment-badge');
    if (!badge) return;
    var count = state.comments.filter(function (comment) { return !comment.resolved; }).length;
    badge.textContent = count || '';
    badge.hidden = count === 0;
  }

  function renderPanel() {
    var comment = state.comments.filter(function (item) { return item.id === state.activeId; })[0];
    panel.classList.add('open');

    if (state.draft) {
      panel.innerHTML = panelHeader('新建反馈') +
        '<form class="comment-compose" data-new-comment>' +
        '<label for="comment-author">你的名字</label>' +
        '<input id="comment-author" name="author" maxlength="30" placeholder="匿名访客" autocomplete="name">' +
        '<label for="comment-message">留言内容</label>' +
        '<textarea id="comment-message" name="message" maxlength="500" rows="5" placeholder="描述问题或提出建议…" required autofocus></textarea>' +
        '<div class="comment-form-actions"><button type="button" class="comment-secondary" data-comment-cancel>取消</button>' +
        '<button type="submit" class="comment-primary">发布反馈 ' + icon('send') + '</button></div>' +
        '<p class="comment-storage-note">反馈仅保存在当前浏览器</p></form>';
      bindPanelActions();
      window.setTimeout(function () {
        var textarea = panel.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 0);
      return;
    }

    if (!comment) {
      closePanel();
      return;
    }

    panel.innerHTML = panelHeader('反馈 #' + (state.comments.indexOf(comment) + 1)) +
      '<div class="comment-thread">' + messageHtml(comment) +
      (comment.replies || []).map(messageHtml).join('') + '</div>' +
      '<form class="comment-reply" data-reply>' +
      '<textarea name="message" maxlength="500" rows="3" placeholder="回复这条反馈…" required></textarea>' +
      '<div class="comment-thread-actions"><button type="button" class="comment-icon-action" data-resolve title="标记为已解决">' + icon('check') + '<span>解决</span></button>' +
      '<button type="button" class="comment-icon-action danger" data-delete title="删除反馈">' + icon('trash') + '<span>删除</span></button>' +
      '<button type="submit" class="comment-primary comment-send" title="发送回复">' + icon('send') + '</button></div></form>';
    bindPanelActions(comment);
  }

  function panelHeader(title) {
    return '<div class="comment-panel-head"><div><span class="comment-panel-kicker">COMMENTS</span><h2>' +
      escapeHtml(title) + '</h2></div><button type="button" class="comment-panel-close" data-comment-close aria-label="关闭">' + icon('close') + '</button></div>';
  }

  function messageHtml(message) {
    return '<article class="comment-message"><div class="comment-avatar">' + escapeHtml((message.author || '匿名').slice(0, 1).toUpperCase()) +
      '</div><div><div class="comment-meta"><b>' + escapeHtml(message.author || '匿名访客') + '</b><time>' +
      formatTime(message.createdAt) + '</time></div><p>' + escapeHtml(message.message).replace(/\n/g, '<br>') + '</p></div></article>';
  }

  function bindPanelActions(comment) {
    var close = panel.querySelector('[data-comment-close]');
    var cancel = panel.querySelector('[data-comment-cancel]');
    if (close) close.addEventListener('click', closePanel);
    if (cancel) cancel.addEventListener('click', closePanel);

    var createForm = panel.querySelector('[data-new-comment]');
    if (createForm) {
      createForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var data = new FormData(createForm);
        var message = String(data.get('message') || '').trim();
        if (!message) return;
        var item = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          x: state.draft.x,
          y: state.draft.y,
          author: String(data.get('author') || '').trim() || '匿名访客',
          message: message,
          createdAt: Date.now(),
          resolved: false,
          replies: []
        };
        state.comments.push(item);
        state.activeId = item.id;
        state.draft = null;
        saveComments();
        renderPins();
        renderPanel();
      });
    }

    var replyForm = panel.querySelector('[data-reply]');
    if (replyForm && comment) {
      replyForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var replyInput = replyForm.querySelector('textarea[name="message"]');
        var message = String(replyInput ? replyInput.value : '').trim();
        if (!message) return;
        if (!Array.isArray(comment.replies)) comment.replies = [];
        comment.replies.push({ author: '访客', message: message, createdAt: Date.now() });
        saveComments();
        renderPanel();
      });

      panel.querySelector('[data-resolve]').addEventListener('click', function () {
        comment.resolved = true;
        saveComments();
        closePanel();
      });

      panel.querySelector('[data-delete]').addEventListener('click', function () {
        if (!window.confirm('确定删除这条反馈及其全部回复吗？')) return;
        state.comments = state.comments.filter(function (item) { return item.id !== comment.id; });
        saveComments();
        closePanel();
      });
    }
  }

  function closePanel() {
    state.activeId = null;
    state.draft = null;
    setPlacing(false);
    panel.classList.remove('open');
    panel.innerHTML = '';
    renderPins();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();