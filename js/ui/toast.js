/* UI: toast notifications */
(function () {
  'use strict';

  window.UP_UI = window.UP_UI || {};
  let timer = null;

  function show(message, ms = 2600) {
    const el = document.getElementById('up-toast');
    if (!el) {
      try { console.log('[toast]', message); } catch {}
      return;
    }
    el.textContent = String(message ?? '');
    el.classList.remove('hidden');
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { el.classList.add('hidden'); }, ms);
  }

  window.UP_UI.toast = { show };
})();
