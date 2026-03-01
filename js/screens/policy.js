(function () {
  const POLICY_VERSION = '2026-02-28_v1';
  const POLICY_KEY = 'up_policy_accepted_v';

  // later you can set real urls
  const TERMS_URL = '';
  const PRIVACY_URL = '';

  let inited = false;

  function getStore(ctx) {
    return (ctx && ctx.storage) ? ctx.storage : null;
  }

  function isAccepted(ctx) {
    const st = getStore(ctx);
    const v = st ? st.get(POLICY_KEY) : localStorage.getItem(POLICY_KEY);
    return v === POLICY_VERSION;
  }

  function setAccepted(ctx) {
    const st = getStore(ctx);
    if (st) st.set(POLICY_KEY, POLICY_VERSION);
    else localStorage.setItem(POLICY_KEY, POLICY_VERSION);
  }

  function show() {
    const el = document.getElementById('policy-screen');
    if (el) el.classList.remove('hidden');
  }

  function hide() {
    const el = document.getElementById('policy-screen');
    if (el) el.classList.add('hidden');
  }

  function openDoc(url, ctx) {
    if (!url) {
      try { ctx.toast && ctx.toast('Документ готовится.'); } catch {}
      return;
    }
    try {
      if (ctx.telegram && typeof ctx.telegram.openLink === 'function') ctx.telegram.openLink(url);
      else window.open(url, '_blank');
    } catch {}
  }

  function init(ctx) {
    if (inited) return;
    inited = true;

    const accept = document.getElementById('policy-accept');
    const cancel = document.getElementById('policy-cancel');
    const chk = document.getElementById('policy-check');
    const terms = document.getElementById('policy-terms');
    const privacy = document.getElementById('policy-privacy');

    if (!accept || !cancel) return;

    const sync = () => { accept.disabled = !(chk && chk.checked); };
    sync();

    if (chk) chk.addEventListener('change', sync);

    if (terms) terms.addEventListener('click', () => openDoc(TERMS_URL, ctx));
    if (privacy) privacy.addEventListener('click', () => openDoc(PRIVACY_URL, ctx));

    cancel.addEventListener('click', () => {
      try {
        if (ctx.telegram && typeof ctx.telegram.close === 'function') ctx.telegram.close();
      } catch {}
    });

    accept.addEventListener('click', () => {
      if (!(chk && chk.checked)) return;
      setAccepted(ctx);
      try { if (typeof ctx.onAccepted === 'function') ctx.onAccepted(); } catch {}
      hide();
    });
  }

  window.UP_SCREENS = window.UP_SCREENS || {};
  window.UP_SCREENS.policy = {
    POLICY_VERSION,
    POLICY_KEY,
    isAccepted,
    show,
    hide,
    init
  };
})();
