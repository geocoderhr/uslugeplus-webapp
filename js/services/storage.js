(function () {
  const K = {
    lang: 'up_lang',

    policyAcceptedV: 'up_policy_accepted_v',   // value: policyVersion
    consentVersion: 'up_consent_version',      // value: version
    consentAt:      'up_consent_at',           // value: ISO datetime

    stars: 'up_stars_balance',
    profileRewardedV1: 'up_profile_rewarded_v1',

    profilePhone: 'up_profile_phone',
    profileEmail: 'up_profile_email',
    profileCity:  'up_profile_city',

    draftQuery: 'up_draft_query'
  };

  function get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return (v === null || v === undefined) ? fallback : v;
    } catch { return fallback; }
  }

  function set(key, value) {
    try { localStorage.setItem(key, String(value)); } catch {}
  }

  function del(key) {
    try { localStorage.removeItem(key); } catch {}
  }

  function resetApp(extraKeys) {
    const keys = Object.values(K);
    keys.forEach(del);
    if (Array.isArray(extraKeys)) extraKeys.forEach(del);
  }

  window.UP_SERVICES = window.UP_SERVICES || {};
  window.UP_SERVICES.storage = { K, get, set, del, resetApp };
})();
