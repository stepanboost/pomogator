# 🤖 Помогатор - Telegram Bot для Mini App

Продакшн-готовый монорепо для Telegram-бота «Помогатор» с воронкой подписки и интеграцией с YooKassa.

## 🏗️ Архитектура

```
pomogator/
├── apps/
│   ├── api/          # Express API сервер
│   └── bot/          # Telegram бот
├── packages/
│   ├── prisma/       # База данных и миграции
│   ├── shared/       # Общие типы и утилиты
│   └── redis/        # Redis клиент и утилиты
└── docker-compose.yml
```

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd pomogator
pnpm install
```

### 2. Настройка окружения

```bash
cp env.example .env
```

Заполните переменные в `.env`:

```env
# Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
WEBAPP_URL=https://your-domain.tld
API_BASE_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# YooKassa Configuration
YK_SHOP_ID=your_yookassa_shop_id
YK_SECRET_KEY=your_yookassa_secret_key
YK_RETURN_URL=https://t.me/your_bot_username?start=paid_

# Database Configuration
DATABASE_URL=postgresql://pomogator:pomogator_password@localhost:5432/pomogator

# Redis Configuration
REDIS_URL=redis://localhost:6379

# App Configuration
APP_BASE_URL=https://api.your-domain.tld
NODE_ENV=development
```

### 3. Запуск с Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 4. Запуск в режиме разработки

```bash
# Запуск базы данных и Redis
docker-compose up -d postgres redis

# Миграции базы данных
pnpm db:migrate

# Запуск в режиме разработки
pnpm dev
```

## 📊 База данных

### Миграции

```bash
# Создание новой миграции
pnpm db:migrate

# Применение миграций в продакшене
pnpm --filter @pomogator/prisma migrate deploy

# Генерация Prisma клиента
pnpm db:generate

# Открытие Prisma Studio
pnpm db:studio
```

### Схема данных

- **User** - пользователи Telegram
- **Access** - доступы (триал, подписка)
- **Payment** - платежи через YooKassa
- **EventLog** - логи событий

## 🔧 API Endpoints

### Аутентификация
- `POST /auth/issue` - выдача JWT токена
- `POST /auth/verify` - проверка JWT токена
- `POST /auth/refresh` - обновление JWT токена

### Доступы
- `GET /access/:userId` - статус доступа пользователя
- `POST /access/start-trial` - активация пробного периода
- `POST /access/cancel-subscription` - отмена подписки

### Платежи
- `POST /payments/create` - создание платежа
- `GET /payments/:paymentId` - статус платежа
- `GET /payments/user/:userId` - платежи пользователя

### Webhooks
- `POST /webhooks/yookassa` - webhook от YooKassa
- `POST /webhooks/telegram` - webhook от Telegram

### События
- `POST /events/log` - логирование события
- `GET /events/user/:userId` - события пользователя
- `GET /events/type/:type` - события по типу

## 🤖 Telegram Bot

### Команды
- `/start` - главное меню с кнопками
- `🚀 Открыть приложение` - открытие Mini App
- `🎁 3 дня бесплатно` - активация триала
- `📘 Туториал` - интерактивный туториал
- `💳 Купить подписку` - создание платежа
- `🙅 Отмена подписки` - отмена подписки
- `👨‍💻 Поддержка` - контакты поддержки

### Сценарии
- **Tutorial Scene** - пошаговый туториал использования

## 💳 Интеграция с YooKassa

### Настройка
1. Создайте магазин в [YooKassa](https://yookassa.ru)
2. Получите `SHOP_ID` и `SECRET_KEY`
3. Настройте webhook URL: `https://your-domain.tld/webhooks/yookassa`

### Платежи
- Создание платежей через API
- Обработка webhook'ов
- Автоматическая активация подписки

## ⏰ Планировщик задач

Автоматические задачи:
- Напоминания о скором окончании триала (за 6 часов)
- Уведомления об окончании триала
- Напоминания о неоплаченных платежах

## 🔒 Безопасность

- JWT токены с коротким сроком жизни (30 минут)
- Валидация подписей Telegram Mini App
- Rate limiting на API endpoints
- Валидация webhook'ов YooKassa
- Helmet для безопасности HTTP заголовков

## 🐳 Docker

### Сборка образов
```bash
# API
docker build -f apps/api/Dockerfile -t pomogator-api .

# Bot
docker build -f apps/bot/Dockerfile -t pomogator-bot .
```

### Docker Compose
```bash
# Запуск всех сервисов
docker-compose up -d

# Пересборка и запуск
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f [service_name]
```

## 📈 Мониторинг

### Health Checks
- API: `GET /health`
- Database: автоматические проверки подключения
- Redis: автоматические проверки подключения

### Логирование
- Структурированные логи в JSON
- Логирование всех событий пользователей
- Ошибки с трейсингом

## 🚀 Деплой

### Railway
1. Подключите репозиторий к Railway
2. Настройте переменные окружения
3. Деплой автоматически запустится

### VPS
1. Установите Docker и Docker Compose
2. Склонируйте репозиторий
3. Настройте `.env`
4. Запустите `docker-compose up -d`

## 🔧 Разработка

### Структура проекта
- **apps/api** - Express API сервер
- **apps/bot** - Telegram бот с Telegraf
- **packages/prisma** - схема базы данных
- **packages/shared** - общие типы и утилиты
- **packages/redis** - Redis клиент

### Скрипты
```bash
# Разработка
pnpm dev

# Сборка
pnpm build

# Запуск
pnpm start

# База данных
pnpm db:migrate
pnpm db:generate
pnpm db:studio

# Docker
pnpm docker:up
pnpm docker:down
pnpm docker:logs
```

## 📝 Лицензия

MIT License

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:
- 📧 Email: support@pomogator.ru
- 💬 Telegram: @pomogator_support
