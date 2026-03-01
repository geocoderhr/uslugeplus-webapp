(function () {
  function ctx(make) {
    // make: { tg, storage, toast, t, showOnly }
    return {
      tg: make.tg,
      telegram: (window.UP_SERVICES && window.UP_SERVICES.telegram) ? window.UP_SERVICES.telegram : null,
      api: (window.UP_SERVICES && window.UP_SERVICES.api) ? window.UP_SERVICES.api : null,
      storage: make.storage,
      toast: make.toast,
      t: make.t,
      showOnly: make.showOnly,
    };
  }

  function initAll(make) {
    const C = ctx(make);

    // policy init (handlers are idempotent)
    try {
      const p = window.UP_SCREENS && window.UP_SCREENS.policy;
      if (p && typeof p.init === 'function') p.init({ telegram: C.telegram, storage: C.storage, toast: C.toast, onAccepted: make.onPolicyAccepted });
    } catch {}

    // registration init/bind is handled when screen opens (same as сейчас)
    // home init/bind is handled via onShow (router hook)
    return C;
  }

  window.UP_CORE = window.UP_CORE || {};
  window.UP_CORE.screens = { ctx, initAll };
})();
