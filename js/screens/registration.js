(function () {
  const NS = (window.UP_SCREENS = window.UP_SCREENS || {});

  // storage keys (MUST stay identical)
  const UP_PROFILE_PHONE = 'up_profile_phone';
  const UP_PROFILE_EMAIL = 'up_profile_email';
  const UP_PROFILE_CITY  = 'up_profile_city';

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
  }

  function isComplete() {
    const p = getProfile();
    return !!(p.phone && p.email && p.city);
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
        if (isComplete()) showOnly('main-menu');
        else showOnly('policy-screen');
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

        toast('Сохранено ✅');
        showOnly('main-menu');
      };
    }
  }

  NS.registration = {
    getProfile,
    setProfile,
        clear,
isComplete,
    bind,
  };
})();
