SYSTEM GOAL:
Собери продакшн-готовый монорепо для Telegram-бота «Помогатор» (вход в Telegram Mini Apps) с воронкой:
1) Приветствие, 2) Туториал, 3) 3-дневный триал, 4) Покупка подписки (ЮKassa), 
5) Сообщение об оплате, 6) Отмена подписки, 7) Выдача доступа, 8) Догрев (если не купил).

STACK:
- Node.js 20+, TypeScript
- Bot: Telegraf (или grammY) + Scenes (wizard для туториала)
- API: Express + zod + helmet + rate-limit
- DB: PostgreSQL + Prisma
- Cache/Queue: Redis (rate-limit и отложенные уведомления)
- Payments: YooKassa (create payment + webhook)
- Auth to TMA: JWT (HS256), exp 30m
- Scheduler: node-cron (или BullMQ) для догрева
- Env: dotenv + zod schema validation

DATA MODEL (Prisma):
- User(id, tgId, username, firstName, createdAt)
- Access(userId FK, status: 'trial' | 'active' | 'expired' | 'canceled', trialStartedAt, trialEndsAt, subscriptionEndsAt, updatedAt)
- Payment(id, userId, provider='yookassa', invoiceId, amount, currency='RUB', status: 'pending'|'succeeded'|'canceled'|'expired', createdAt, updatedAt, meta JSON)
- EventLog(id, userId, type, payload JSON, createdAt)

ENV (validate with zod):
- BOT_TOKEN
- WEBAPP_URL (https://app.your-domain.tld)  // TMA домен уже /setdomain
- API_BASE_URL (бот будет дергать /auth/issue и т.п.)
- JWT_SECRET
- YK_SHOP_ID
- YK_SECRET_KEY
- YK_RETURN_URL (deeplink t.me/<bot>?start=paid_<id>)
- DATABASE_URL
- REDIS_URL
- APP_BASE_URL (публичный URL бэкенда для вебхуков, напр. https://api.your-domain.tld)

BOT FLOWS:
- /start:
  - Приветствие + инлайн-кнопки:
    [🚀 Открыть приложение], [🎁 3 дня бесплатно], [📘 Туториал], [💳 Купить подписку], [🙅 Отмена подписки], [👨‍💻 Поддержка]
- "Открыть приложение":
  - Запрос к API /auth/issue -> если access ok -> replyKeyboard with web_app { url: WEBAPP_URL + "?token=<jwt>" }
  - Если доступа нет -> показать CTA «Включить триал» или «Купить»
- "3 дня бесплатно":
  - Если триала не было: создать Access(status='trial', trialEndsAt=now()+3d), EventLog, success message + кнопка «Открыть приложение»
  - Если был: сообщить дату окончания триала / почему недоступно
- "Купить подписку":
  - POST /payments/create -> YooKassa create payment (amount=XXX.00, capture=true, description="Помогатор: месячная подписка", return_url=YK_RETURN_URL)
  - Вернуть короткую ссылку на оплату (кнопка «Оплатить»)
- WEBHOOK /payments/yookassa:
  - Проверить сигнатуру/Basic Auth, найти payment по invoiceId
  - Если status=succeeded -> Access: status='active', subscriptionEndsAt=now()+30d
  - Отправить пользователю сообщение «Оплата прошла» + кнопка «Открыть приложение»
- "Отмена подписки":
  - Пометить Access.status='canceled' (или вызвать Subscriptions API, если включена рекуррентка)
  - Сообщить пользователю о дате деактивации
- Догрев:
  - cron: 
    - за 6 часов до trialEndsAt -> напомнить и дать -10%
    - в момент trialEndsAt -> «триал закончился», кнопка «Купить»
    - через 48 часов после созданного платежа со статусом pending -> «вернуться к оплате»

SECURITY:
- Валидация initData (если используем Telegram WebApp initData) и подписи
- JWT короткий срок (30m), обновление токена по кнопке в боте
- Rate limiting на вебхуках и create payment

DELIVERABLES:
- /apps/bot (Telegraf app)
- /apps/api (Express API)
- /packages/prisma (schema + migrations)
- /packages/shared (DTOs, zod-схемы)
- scripts: dev, build, start (pnpm)
- README с шагами запуска, командами миграций, webhook setup
- Dockerfile + docker-compose (postgres, redis, api, bot)
