(function () {
  let bound = false;

  function getReg() {
    return window.UP_SCREENS && window.UP_SCREENS.registration;
  }

  function isProfileComplete() {
    const reg = getReg();
    try { return !!(reg && typeof reg.isComplete === 'function' && reg.isComplete()); } catch { return false; }
  }

  function bindProfileHandlers(ctx) {
    const reg = getReg();
    if (!reg || typeof reg.bind !== 'function') return;
    try { reg.bind({ tg: ctx.tg, t: ctx.t, toast: ctx.toast, showOnly: ctx.showOnly, storage: ctx.storage }); } catch {}
  }

  function updateHomeUI(ctx) {
    // stars
    let stars = 0;
    try {
      const reg = getReg();
      if (reg && typeof reg.getStars === 'function') stars = reg.getStars();
      else stars = parseInt((ctx.storage ? ctx.storage.get('up_stars_balance') : localStorage.getItem('up_stars_balance')) || '0', 10) || 0;
    } catch {}

    const sc = document.getElementById('up-stars-count');
    if (sc) sc.textContent = String(stars);

    // completion %
    let pct = 0;
    try {
      const reg = getReg();
      if (reg && typeof reg.completionPct === 'function') pct = reg.completionPct();
      else {
        const st = ctx.storage;
        const phone = ((st ? st.get('up_profile_phone') : localStorage.getItem('up_profile_phone')) || '').trim();
        const email = ((st ? st.get('up_profile_email') : localStorage.getItem('up_profile_email')) || '').trim();
        const city  = ((st ? st.get('up_profile_city')  : localStorage.getItem('up_profile_city'))  || '').trim();
        pct = (phone ? 34 : 0) + (email ? 33 : 0) + (city ? 33 : 0);
      }
    } catch {}

    pct = parseInt(pct, 10);
    if (!Number.isFinite(pct)) pct = 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    const pe = document.getElementById('up-profile-pct');
    if (pe) pe.textContent = pct + '%';
    const bar = document.getElementById('up-profile-bar');
    if (bar) bar.style.width = pct + '%';

    const banner = document.getElementById('up-profile-banner');
    if (banner) {
      if (pct >= 100) banner.classList.add('hidden');
      else banner.classList.remove('hidden');
    }
  }

  function action(type, ctx) {
    try { ctx.telegram && ctx.telegram.haptic && ctx.telegram.haptic('light'); } catch {}

    if (type === 'create_request' || type === 'be_provider') {
      if (!isProfileComplete()) {
        ctx.toast('Заполните профиль, чтобы продолжить.');
        bindProfileHandlers(ctx);
        ctx.showOnly('profile-screen');
        return;
      }
    }

    if (type === 'profile') {
      bindProfileHandlers(ctx);
      ctx.showOnly('profile-screen');
      return;
    }

    if (type === 'reset_app') {
      // clear known keys through storage service if available
      try {
        if (ctx.storage && ctx.storage.resetApp) ctx.storage.resetApp();
        else {
          localStorage.removeItem('up_lang');
          localStorage.removeItem('up_policy_accepted_v');
          localStorage.removeItem('up_consent_version');
          localStorage.removeItem('up_stars_balance');
          localStorage.removeItem('up_profile_rewarded_v1');
          localStorage.removeItem('up_consent_at');
          localStorage.removeItem('up_profile_phone');
          localStorage.removeItem('up_profile_email');
          localStorage.removeItem('up_profile_city');
          localStorage.removeItem('up_draft_query');
        }
      } catch {}

      // let registration screen clear its own cache if it has special logic
      try {
        const reg = getReg();
        if (reg && typeof reg.clear === 'function') reg.clear();
      } catch {}

      try { location.href = location.pathname + '?v=' + Date.now(); } catch {}
      return;
    }

    ctx.toast('Выбрано: ' + type + '. Скоро здесь будет логика n8n!');
  }

  function bind(ctx) {
    if (bound) return;
    bound = true;

    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };

    on('home-profile', () => action('profile', ctx));
    on('home-create',  () => action('create_request', ctx));
    on('home-provider',() => action('be_provider', ctx));
    on('home-referral',() => action('referral', ctx));
    on('home-reset',   () => action('reset_app', ctx));
    on('up-profile-cta', () => action('profile', ctx));

    const catsAll = document.getElementById('home-cats-all');
    if (catsAll) catsAll.onclick = (e) => { try { e.preventDefault(); } catch {} action('categories', ctx); };

    const send = document.getElementById('home-send');
    if (send) send.onclick = () => {
      const q = (document.getElementById('home-query') || {}).value || '';
      const v = String(q).trim();
      if (v) {
        try { if (ctx.storage) ctx.storage.set('up_draft_query', v); else localStorage.setItem('up_draft_query', v); } catch {}
      }
      action('create_request', ctx);
    };

    document.querySelectorAll('#main-menu [data-action]').forEach((el) => {
      el.addEventListener('click', () => {
        const a = el.getAttribute('data-action') || '';
        action(a || 'noop', ctx);
      });
    });

    // react to profile changes if registration screen dispatches events
    try { window.addEventListener('up:profile', () => updateHomeUI(ctx)); } catch {}
    try { window.addEventListener('up:stars', () => updateHomeUI(ctx)); } catch {}
  }

  function onShow(ctx) {
    bind(ctx);
    updateHomeUI(ctx);
  }

  window.UP_SCREENS = window.UP_SCREENS || {};
  window.UP_SCREENS.home = { bind, onShow, updateHomeUI };
})();
