(function () {
  const NS = (window.UP_SCREENS = window.UP_SCREENS || {});

  // storage keys (MUST stay identical)
  const UP_PROFILE_PHONE = 'up_profile_phone';
  const UP_PROFILE_EMAIL = 'up_profile_email';
  const UP_PROFILE_CITY  = 'up_profile_city';

  // stars (local)
  const UP_STARS_KEY = 'up_stars_balance';
  const UP_PROFILE_REWARD_KEY = 'up_profile_rewarded_v1';
  const UP_PROFILE_REWARD_AMOUNT = 30;

  function getStars() {
    const raw = String(localStorage.getItem(UP_STARS_KEY) || '0').trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function setStars(n) {
    const v = Math.max(0, Number(n) || 0);
    localStorage.setItem(UP_STARS_KEY, String(Math.floor(v)));
  }

  function addStars(delta) {
    setStars(getStars() + (Number(delta) || 0));
    return getStars();
  }

  function getProfile() {
    return {
      phone: (localStorage.getItem(UP_PROFILE_PHONE) || '').trim(),
      email: (localStorage.getItem(UP_PROFILE_EMAIL) || '').trim(),
      city:  (localStorage.getItem(UP_PROFILE_CITY)  || '').trim(),
    };
  }

  function setProfile(next) {
    const p = next || {};
    localStorage.setItem(UP_PROFILE_PHONE, String(p.phone || '').trim());
    localStorage.setItem(UP_PROFILE_EMAIL, String(p.email || '').trim());
    localStorage.setItem(UP_PROFILE_CITY,  String(p.city  || '').trim());
  }

  function clear() {
    localStorage.removeItem(UP_PROFILE_PHONE);
    localStorage.removeItem(UP_PROFILE_EMAIL);
    localStorage.removeItem(UP_PROFILE_CITY);
    localStorage.removeItem(UP_PROFILE_REWARD_KEY);
  }

  function isComplete() {
    const p = getProfile();
    return !!(p.phone && p.email && p.city);
  }

  function completionPct() {
    const p = getProfile();
    const filled = [p.phone, p.email, p.city].filter(Boolean).length;
    return Math.round((filled / 3) * 100);
  }

  function rewardIfEligible() {
    if (!isComplete()) return { rewarded: false, stars: getStars() };

    const already = localStorage.getItem(UP_PROFILE_REWARD_KEY) === '1';
    if (already) return { rewarded: false, stars: getStars() };

    localStorage.setItem(UP_PROFILE_REWARD_KEY, '1');
    const stars = addStars(UP_PROFILE_REWARD_AMOUNT);
    return { rewarded: true, stars };
  }

  let bound = false;

  function bind(opts) {
    if (bound) return;
    bound = true;

    const tg = opts && opts.tg;
    const t = (opts && opts.t) || ((k) => k);
    const toast = (opts && opts.toast) || ((m) => { try { console.log('[toast]', m); } catch {} });
    const showOnly = (opts && opts.showOnly) || (() => {});

    const phone = document.getElementById('profile-phone');
    const email = document.getElementById('profile-email');
    const city  = document.getElementById('profile-city');
    const save  = document.getElementById('profile-save');
    const back  = document.getElementById('profile-back');

    const fill = () => {
      const p = getProfile();
      if (phone) phone.value = p.phone;
      if (email) email.value = p.email;
      if (city)  city.value  = p.city;
    };

    fill();

    if (back) {
      back.onclick = () => {
        try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch {}
        showOnly('main-menu');
      };
    }

    if (save) {
      save.onclick = () => {
        try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch {}

        setProfile({
          phone: (phone ? phone.value : ''),
          email: (email ? email.value : ''),
          city:  (city  ? city.value  : ''),
        });

        if (!isComplete()) {
          toast(t('profile_need_all'));
          return;
        }

        const r = rewardIfEligible();
        if (r.rewarded) toast(`Профиль заполнен ⭐ +${UP_PROFILE_REWARD_AMOUNT}`);
        else toast('Профиль сохранён ✅');

        showOnly('main-menu');
      };
    }
  }

  NS.registration = {
    getProfile,
    setProfile,
    clear,
    isComplete,
    completionPct,
    getStars,
    setStars,
    addStars,
    rewardIfEligible,
    bind,
  };
})();
