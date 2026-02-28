    /* ===== Telegram ===== */
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
        hr_soon: 'Hrvatski в разработке.'
      },
      hr: {
        // Пока пусто: оставляем структуру, чтобы потом просто заполнить ключи
      }
    };

    let lang = localStorage.getItem('up_lang') || 'ru';

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
    }

    function showOnly(screenId) {
      const ids = ['lang-screen', 'loading-screen', 'main-menu'];
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
          showOnly('main-menu');
          console.log('User authorized:', data.user);
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
        location.href = location.pathname + '?v=' + Date.now();
        return;
      }

      alert('Выбрано: ' + type + '. Скоро здесь будет логика n8n!');
    }

    bootstrap();
  
