(function () {
  const SCREEN_IDS = ['lang-screen', 'loading-screen', 'policy-screen', 'profile-screen', 'main-menu'];

  function showOnly(screenId, hooks) {
    SCREEN_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    // hooks: { onMainMenu: fn }
    if (screenId === 'main-menu' && hooks && typeof hooks.onMainMenu === 'function') {
      try { hooks.onMainMenu(); } catch {}
    }
  }

  window.UP_CORE = window.UP_CORE || {};
  window.UP_CORE.router = { SCREEN_IDS, showOnly };
})();
