# UslugePlus WebApp: структура проекта

## Точка входа
- `index.html` — содержит DOM всех экранов и подключает скрипты в порядке: UI → screens → core → services → app.
- `app.js` — сценарий запуска: bootstrap → auth → routeAfterAuth → showOnly(screen).

## Экраны (screens)
Каждый экран живёт отдельным файлом и отвечает только за своё поведение:
- `js/screens/policy.js` — экран условий (policy-screen): проверка принятия, обработчики кнопок, сохранение версии.
- `js/screens/registration.js` — экран профиля (profile-screen): ввод phone/email/city, прогресс, звёзды (если есть).
- `js/screens/home.js` — главный экран (main-menu): действия меню, категории, баннер заполнения профиля, reset.

## Навигация (core)
- `js/core/router.js` — единый способ показать один экран и скрыть остальные (`showOnly`).

## Сервисы (services)
Внешний мир и состояние:
- `js/services/telegram.js` — Telegram WebApp SDK: init, haptic, openLink, close.
- `js/services/api.js` — API-клиент: POST JSON, authTelegram.
- `js/services/storage.js` — localStorage-обёртка + единые ключи + reset.

## UI (ui)
- `js/ui/toast.js` — уведомления.

## Правило ответственности
- Screens: UI + обработчики + минимум бизнес-логики конкретного экрана.
- Services: Telegram/API/Storage, никаких DOM-манипуляций.
- Core: роутинг и базовые “каркасные” функции.
- app.js: склейка и последовательность шагов (как сценарий).

---

## Контракты модулей (чтобы не путаться через месяц)

### 1) Screens (js/screens/*)
Экран это файл, который:
- знает свой DOM (id элементов),
- вешает обработчики,
- обновляет UI при показе,
- не ходит напрямую в fetch/localStorage (через services).

**Рекомендуемый публичный интерфейс экрана:**
- `bind(ctx)` — навесить обработчики (один раз, с защитой от повторов)
- `onShow(ctx)` — обновить UI при показе (может вызываться много раз)
- (опционально) `onHide(ctx)` — если нужно чистить таймеры/подписки
- (для registration) `isComplete()`, `completionPct()`, `getStars()`, `clear()`

`ctx` это единый контекст из `UP_CORE.screens.ctx()`:
- `ctx.telegram` / `ctx.tg`
- `ctx.api`
- `ctx.storage`
- `ctx.toast`
- `ctx.t`
- `ctx.showOnly`

### 2) Services (js/services/*)
Сервис это “внешний мир” и состояние:
- Telegram SDK
- API client
- Storage

**Правило:** сервисы не трогают DOM. Вообще.

### 3) Core (js/core/*)
Каркас приложения:
- роутинг экранов (`router.js`)
- сборка контекста и единая инициализация (`screens.js`)
- сюда же позже можно вынести i18n, если вырастет

### 4) app.js
Сценарий запуска:
- init telegram/storage
- auth
- gate: policy/consent
- showOnly()

**Правило:** app.js не должен разрастаться бизнес-логикой экранов.
Если появляется логика “кнопка X делает Y на экране Z”, ей место в `js/screens/z.js`.

---

## Как добавить новый экран (чеклист)

1) **index.html**
- Добавь новый блок экрана: `<div id="new-screen" class="hidden"> ... </div>`

2) **js/screens/new.js**
- Создай файл экрана и экспортируй в `window.UP_SCREENS.new = { bind, onShow, ... }`

3) **index.html**
- Подключи скрипт `new.js` рядом с остальными screens (до core/services/app)

4) **router.js**
- Добавь `new-screen` в `SCREEN_IDS`, если это отдельный экран

5) **переход**
- Для перехода используй `showOnly('new-screen')` из ctx

---

## Быстрый поиск “кто за что отвечает”

- “Где логика главного меню?” → `js/screens/home.js`
- “Где логика профиля?” → `js/screens/registration.js`
- “Где политика/условия?” → `js/screens/policy.js`
- “Где роутинг?” → `js/core/router.js`
- “Где контекст и общая инициализация экранов?” → `js/core/screens.js`
- “Где запросы к API?” → `js/services/api.js`
- “Где Telegram SDK?” → `js/services/telegram.js`
- “Где ключи localStorage/reset?” → `js/services/storage.js`
