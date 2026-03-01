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
