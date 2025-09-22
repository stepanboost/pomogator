# 🤖 Деплой бота на Railway

## Пошаговая инструкция

### 1️⃣ Создание нового проекта Railway

1. **Открой [railway.app](https://railway.app)**
2. **Нажми "New Project"**
3. **Выбери "Empty Project"**
4. **Назови проект**: `pomogator-bot`

### 2️⃣ Добавление сервиса бота

1. **Нажми "New Service"**
2. **Выбери "GitHub Repo"**
3. **Выбери репозиторий**: `stepanboost/pomogator`
4. **Укажи Root Directory**: `apps/bot`
5. **Нажми "Deploy"**

### 3️⃣ Настройка переменных окружения

После деплоя перейди в **Settings → Variables** и добавь:

```bash
# Основные настройки
NODE_ENV=production
BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE

# URL'ы твоих сервисов (замени на реальные)
API_BASE_URL=https://твой-api-url.railway.app
WEBAPP_URL=https://твой-webapp-url.railway.app

# База данных (если используешь общую)
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway

# Redis (если используешь)
REDIS_URL=redis://redis.railway.internal:6379

# JWT секрет (минимум 32 символа)
JWT_SECRET=твой_супер_секретный_ключ_минимум_32_символа

# YooKassa (для платежей)
YK_SHOP_ID=твой_yookassa_shop_id
YK_SECRET_KEY=твой_yookassa_secret_key
YK_RETURN_URL=https://t.me/твой_бот?start=paid_
```

### 4️⃣ Настройка мини-приложения в BotFather

1. **Открой [@BotFather](https://t.me/botfather)**
2. **Команда**: `/mybots`
3. **Выбери своего бота**
4. **Bot Settings** → **Mini App**
5. **Установи URL**: `https://твой-webapp-url.railway.app`

### 5️⃣ Проверка работы

После настройки:

1. **Найди своего бота** в Telegram
2. **Нажми** `/start`
3. **Активируй** пробный период
4. **Нажми** "🚀 Открыть приложение"
5. **Проверь**, что веб-приложение открывается

## 🔧 Возможные проблемы

### Ошибка "Application error"
- Проверь переменные окружения
- Убедись, что URL'ы правильные
- Проверь логи в Railway Dashboard

### Бот не отвечает
- Проверь BOT_TOKEN
- Убедись, что бот запущен
- Проверь логи в Railway Dashboard

### Мини-приложение не открывается
- Проверь WEBAPP_URL в BotFather
- Убедись, что веб-приложение работает
- Проверь, что URL начинается с https://

## 📱 Результат

После настройки у тебя будет:
- ✅ **Бот** работает на Railway
- ✅ **Мини-приложение** открывается в Telegram
- ✅ **Система подписок** функционирует
- ✅ **Пробный период** активируется
- ✅ **Платежи** интегрированы

## 🔗 Связь между сервисами

```
Telegram User → Bot (Railway) → API (Railway) → Database
                    ↓
              Mini App (Railway) → API (Railway) → Database
```

Все готово! 🚀
