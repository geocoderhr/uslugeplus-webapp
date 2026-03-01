(function () {
  const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

  function init() {
    if (!tg) return null;
    try { tg.ready(); } catch {}
    try { tg.expand(); } catch {}
    return tg;
  }

  function get() {
    return tg;
  }

  function haptic(type) {
    if (!tg || !tg.HapticFeedback) return;
    try { tg.HapticFeedback.impactOccurred(type || 'light'); } catch {}
  }

  function openLink(url) {
    if (!url) return false;
    if (tg && typeof tg.openLink === 'function') { try { tg.openLink(url); return true; } catch {} }
    try { window.open(url, '_blank'); return true; } catch {}
    return false;
  }

  function close() {
    if (tg && typeof tg.close === 'function') { try { tg.close(); return true; } catch {} }
    return false;
  }

  window.UP_SERVICES = window.UP_SERVICES || {};
  window.UP_SERVICES.telegram = { init, get, haptic, openLink, close };
})();
