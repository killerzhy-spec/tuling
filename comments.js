(function () {
  'use strict';

  if (!window.TuringFeedbackModule || typeof window.TuringFeedbackModule.init !== 'function') {
    console.error('Feedback module is not loaded. Please include feedback-module/feedback-module.js before comments.js');
    return;
  }

  var defaults = {
    apiUrl: 'https://laywjthtguofbgccohzx.supabase.co/rest/v1/page_comments',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxheXdqdGh0Z3VvZmJnY2NvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODgwMTcsImV4cCI6MjEwMTM2NDAxN30.aswaws2CLwjYZ_hX613UBTFOeMffQQN61JTE7u8xH5o',
    deletePassword: '000000',
    storagePrefix: 'turing-comment',
    pollInterval: 20000,
    pagePathResolver: function () {
      var pathEnd = location.pathname.split('/').filter(Boolean).pop() || '';
      return /\.html$/i.test(pathEnd) ? pathEnd : 'index.html';
    }
  };

  var externalConfig = (window.FEEDBACK_CONFIG && typeof window.FEEDBACK_CONFIG === 'object')
    ? window.FEEDBACK_CONFIG
    : {};

  window.TuringFeedbackModule.init(Object.assign({}, defaults, externalConfig));
})();