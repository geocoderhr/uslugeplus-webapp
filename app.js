/* ===== Telegram ===== */

// --- Policy gate (must accept before using app) ---
const UP_POLICY_VERSION = '2026-02-28_v1';
const UP_POLICY_KEY = 'up_policy_accepted_v';

// позже заменим на реальные страницы
const UP_TERMS_URL = '';
const UP_PRIVACY_URL = '';

function policyIsAccepted(){
  return localStorage.getItem(UP_POLICY_KEY) === UP_POLICY_VERSION;
}

function policyShow(){
  const el = document.getElementById('policy-screen');
  if (el) el.classList.remove('hidden');
}

function policyHide(){
  const el = document.getElementById('policy-screen');
  if (el) el.classList.add('hidden');
}

function policyOpen(url){
  if (!url){
    alert('Документ готовится.');
    return;
  }
  if (tg && tg.openLink) tg.openLink(url);
  else window.open(url, '_blank');
}

let policyInited = false;

function policyInit(){
  if (policyInited) return;
  policyInited = true;
  const accept = document.getElementById('policy-accept');
  const cancel = document.getElementById('policy-cancel');
  const chk = document.getElementById('policy-check');
  const terms = document.getElementById('policy-terms');
  const privacy = document.getElementById('policy-privacy');

  if (!accept || !cancel) return;

  // кнопка активна только когда стоит галочка
  const sync = () => { if (accept) accept.disabled = !(chk && chk.checked); };
  sync();

  if (chk) chk.addEventListener('change', sync);

  if (terms) terms.addEventListener('click', () => policyOpen(UP_TERMS_URL));
  if (privacy) privacy.addEventListener('click', () => policyOpen(UP_PRIVACY_URL));

  cancel.addEventListener('click', () => { if (tg && tg.close) tg.close(); });

  accept.addEventListener('click', () => {
    if (!(chk && chk.checked)) return;
    localStorage.setItem(UP_POLICY_KEY, UP_POLICY_VERSION);
    try { if (typeof setConsent === 'function') setConsent(); } catch {}
    policyHide();
    // если есть showOnly, возвращаемся туда
    try { if (typeof showOnly === 'function') showOnly('main-menu'); } catch {}
  });
}

const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
if (tg) {
  tg.ready();
  tg.expand();
}

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
    policy_cancel: 'Отмена'
  },
  hr: {
    // Пока пусто: оставляем структуру, чтобы потом просто заполнить ключи
  }
};

let lang = localStorage.getItem('up_lang') || 'ru';

/* ===== Consent state ===== */
const CONSENT_VERSION = 'v1';
const CONSENT_KEY = 'up_consent_version';
const CONSENT_AT_KEY = 'up_consent_at';

function hasConsent() {
  return localStorage.getItem(CONSENT_KEY) === CONSENT_VERSION;
}

function setConsent() {
  localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
  localStorage.setItem(CONSENT_AT_KEY, new Date().toISOString());
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
}

function showOnly(screenId) {
  const ids = ['lang-screen', 'loading-screen', 'policy-screen', 'main-menu'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === screenId) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}

function setLang(next) {
  lang = next;
  localStorage.setItem('up_lang', lang);
  applyTexts();

}

/* ===== Policy gate ===== */
function routeAfterAuth() {
  if (!(hasConsent() || policyIsAccepted())) {
    try { policyInit(); } catch {}
    showOnly('policy-screen');
    return;
  }
  showOnly('main-menu');
}

/* ===== auth ===== */
async function startAuth() {
  showOnly('loading-screen');

  try {
    const response = await fetch('https://api.uslugeplus.com/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg ? tg.initData : '' })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('User authorized:', data.user);
      routeAfterAuth();
    } else {
      alert(t('auth_error'));
    }
  } catch (e) {
    alert(t('net_error'));
  }
}

/* ===== bootstrap ===== */
function bootstrap() {
  applyTexts();
  try { policyInit(); } catch {}

  const saved = localStorage.getItem('up_lang');
  if (!saved) {
    showOnly('lang-screen');

    const ru = document.getElementById('lang-ru');
    const hr = document.getElementById('lang-hr');

    if (ru) {
      ru.onclick = () => {
        if (tg) tg.HapticFeedback.impactOccurred('light');
        setLang('ru');
        startAuth();
      };
    }

    if (hr) {
      hr.onclick = () => {
        if (tg) tg.HapticFeedback.impactOccurred('light');
        alert(t('hr_soon'));
      };
    }

    return;
  }

  setLang(saved);
  startAuth();
}

/* ===== menu actions ===== */
function action(type) {
  if (tg) tg.HapticFeedback.impactOccurred('light');

  if (type === 'reset_app') {
    localStorage.removeItem('up_lang');
    localStorage.removeItem(UP_POLICY_KEY);
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_AT_KEY);
    location.href = location.pathname + '?v=' + Date.now();
    return;
  }

  alert('Выбрано: ' + type + '. Скоро здесь будет логика n8n!');
}

bootstrap();
