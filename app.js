/* ===== Telegram ===== */


const tg = (window.UP_SERVICES && window.UP_SERVICES.telegram) ? window.UP_SERVICES.telegram.init() : null;
const st = (window.UP_SERVICES && window.UP_SERVICES.storage) ? window.UP_SERVICES.storage : null;

/* ===== i18n skeleton: RU сейчас, HR заглушка (готовим структуру под EN позже) ===== */
const I18N = {
  ru: {
    lang_title: 'Язык',
    lang_subtitle: 'Выберите язык интерфейса.',
    ru_badge: 'сейчас',
    hr_badge: 'в разработке',
    loading: 'Авторизация...',
    menu_title: 'Главное меню',
    m_create: '📝 Создать заявку',
    m_provider: '🛠 Я исполнитель',
    m_profile: '👤 Профиль',
    m_referral: '🎁 Бонусы',
    m_reset: '♻️ Сбросить данные',
    auth_error: 'Ошибка авторизации. Попробуйте перезапустить приложение.',
    net_error: 'Ошибка связи с сервером',
    hr_soon: 'Hrvatski в разработке.',

    policy_title: 'Условия',
    policy_text: 'Чтобы продолжить, нужно принять условия пользования и согласие на обработку персональных данных.',
    policy_link: 'Прочитать условия',
    policy_accept: 'Запустить',
    policy_cancel: 'Отмена',

    profile_title: 'Регистрация',
    profile_text: 'Нужны контакты, чтобы мы могли подтвердить заявки и связаться с вами.',
    profile_phone: 'Телефон',
    profile_email: 'Email',
    profile_city: 'Город',
    profile_save: 'Сохранить',
    profile_back: 'Назад',
    profile_need_all: 'Заполните телефон, email и город.'
  },
  hr: {
    // Пока пусто: оставляем структуру, чтобы потом просто заполнить ключи
  }
};

let lang = (st ? st.get('up_lang') : localStorage.getItem('up_lang')) || 'ru';

/* ===== Consent state ===== */

/* ===== Profile state (registration) ===== */
function isProfileComplete() {
  const reg = window.UP_SCREENS && window.UP_SCREENS.registration;
  try { return !!(reg && typeof reg.isComplete === 'function' && reg.isComplete()); } catch { return false; }
}

function bindProfileHandlers() {
  const reg = window.UP_SCREENS && window.UP_SCREENS.registration;
  if (!reg || typeof reg.bind !== 'function') return;

  const make = { tg: tg, storage: st, toast: showToast, t: t, showOnly: showOnly };
  const ctx = (window.UP_CORE && window.UP_CORE.screens && typeof window.UP_CORE.screens.ctx === 'function')
    ? window.UP_CORE.screens.ctx(make)
    : make;

  try { reg.bind(ctx); } catch {}
}

const CONSENT_VERSION = 'v1';
const CONSENT_KEY = 'up_consent_version';
const CONSENT_AT_KEY = 'up_consent_at';

function hasConsent() {
  return (st ? st.get(CONSENT_KEY) : localStorage.getItem(CONSENT_KEY)) === CONSENT_VERSION;
}

function setConsent() {
  if (st) st.set(CONSENT_KEY, CONSENT_VERSION); else localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
  if (st) st.set(CONSENT_AT_KEY, new Date().toISOString()); else localStorage.setItem(CONSENT_AT_KEY, new Date().toISOString());
}

/* ===== helpers ===== */
function t(key) {
  const pack = I18N[lang] || I18N.ru;
  return (pack && pack[key]) || (I18N.ru[key]) || key;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showToast(message, ms = 2600) {
  const fn = window.UP_UI && window.UP_UI.toast && window.UP_UI.toast.show;
  if (typeof fn === 'function') return fn(message, ms);
  try { console.log('[toast]', message); } catch {}
}


function applyTexts() {
  document.documentElement.lang = lang;

  setText('lang-title', t('lang_title'));
  setText('lang-subtitle', t('lang_subtitle'));
  setText('lang-ru-badge', t('ru_badge'));
  setText('lang-hr-badge', t('hr_badge'));

  setText('loading-text', t('loading'));
  setText('menu-title', t('menu_title'));

  setText('menu-create', t('m_create'));
  setText('menu-provider', t('m_provider'));
  setText('menu-profile', t('m_profile'));
  setText('menu-referral', t('m_referral'));
  setText('menu-reset', t('m_reset'));

  setText('policy-title', t('policy_title'));
  setText('policy-text', t('policy_text'));
  setText('policy-link', t('policy_link'));
  setText('policy-accept', t('policy_accept'));
  setText('policy-cancel', t('policy_cancel'));

  setText('profile-title', t('profile_title'));
  setText('profile-text', t('profile_text'));
  setText('profile-phone-label', t('profile_phone'));
  setText('profile-email-label', t('profile_email'));
  setText('profile-city-label', t('profile_city'));
  setText('profile-save', t('profile_save'));
  setText('profile-back', t('profile_back'));
}

function showOnly(screenId) {
  const r = window.UP_CORE && window.UP_CORE.router;
  if (r && typeof r.showOnly === 'function') {
    return r.showOnly(screenId, {
      onMainMenu: () => {
        try { (window.UP_SCREENS && window.UP_SCREENS.home && window.UP_SCREENS.home.onShow) && window.UP_SCREENS.home.onShow({ telegram: window.UP_SERVICES.telegram, tg: tg, storage: st, toast: showToast, showOnly: showOnly, t: t }); } catch {}
      }
    });
  }

  // fallback if router is not loaded
  const ids = ['lang-screen', 'loading-screen', 'policy-screen', 'profile-screen', 'main-menu'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === screenId) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  if (screenId === 'main-menu') {
    try { (window.UP_SCREENS && window.UP_SCREENS.home && window.UP_SCREENS.home.onShow) && window.UP_SCREENS.home.onShow({ telegram: window.UP_SERVICES.telegram, tg: tg, storage: st, toast: showToast, showOnly: showOnly, t: t }); } catch {}
  }
}

function setLang(next) {
  lang = next;
  if (st) st.set('up_lang', lang); else localStorage.setItem('up_lang', lang);
  applyTexts();

}




/* ===== Policy gate ===== */
function routeAfterAuth() {
  if (!(hasConsent() || ((window.UP_SCREENS && window.UP_SCREENS.policy && window.UP_SCREENS.policy.isAccepted) ? window.UP_SCREENS.policy.isAccepted({ storage: st }) : false))) {
    try { (window.UP_CORE && window.UP_CORE.screens && window.UP_CORE.screens.initAll) && window.UP_CORE.screens.initAll({ tg: tg, storage: st, toast: showToast, t: t, showOnly: showOnly, onPolicyAccepted: routeAfterAuth }); } catch {}
    showOnly('policy-screen');
    return;
  }
  try { bindProfileHandlers(); } catch {}
  showOnly('main-menu');
}

 /* ===== auth ===== */
async function startAuth() {
  showOnly('loading-screen');

  try {
    const { status, data } = await (window.UP_SERVICES && window.UP_SERVICES.api ? window.UP_SERVICES.api.authTelegram(tg ? tg.initData : "") : Promise.resolve({ status: 0, data: { ok: false, error: "api_missing" } }));

    if (data.ok) {
      console.log('User authorized:', data.user);
      routeAfterAuth();
    } else {
      showToast(t('auth_error'), 4200);
    }
  } catch (e) {
    showToast(t('net_error'), 4200);
  }
}

/* ===== bootstrap ===== */
function bootstrap() {
  applyTexts();
  try { (window.UP_CORE && window.UP_CORE.screens && window.UP_CORE.screens.initAll) && window.UP_CORE.screens.initAll({ tg: tg, storage: st, toast: showToast, t: t, showOnly: showOnly, onPolicyAccepted: routeAfterAuth }); } catch {}
  const saved = st ? st.get('up_lang') : localStorage.getItem('up_lang');
  if (!saved) {
    showOnly('lang-screen');

    const ru = document.getElementById('lang-ru');
    const hr = document.getElementById('lang-hr');

    if (ru) {
      ru.onclick = () => {
        try { window.UP_SERVICES.telegram.haptic('light'); } catch {}
        setLang('ru');
        startAuth();
      };
    }

    if (hr) {
      hr.onclick = () => {
        try { window.UP_SERVICES.telegram.haptic('light'); } catch {}
        showToast(t('hr_soon'));
      };
    }

    return;
  }

  setLang(saved);
  startAuth();
}

bootstrap();
