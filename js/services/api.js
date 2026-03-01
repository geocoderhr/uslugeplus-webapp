(function () {
  const BASE = 'https://api.uslugeplus.com';

  async function postJSON(path, payload) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });

    let data = null;
    try { data = await res.json(); }
    catch { data = { ok: false, error: 'bad_json' }; }

    return { status: res.status, data };
  }

  async function authTelegram(initData) {
    return postJSON('/auth/telegram', { initData: initData || '' });
  }

  window.UP_SERVICES = window.UP_SERVICES || {};
  window.UP_SERVICES.api = { BASE, postJSON, authTelegram };
})();
