# 🤖 Деплой полного бота на Railway

## ✅ Бот протестирован локально и работает!

Теперь деплоим полный функционал на Railway.

---

## 📋 Пошаговая инструкция

### 1️⃣ Создание проекта Railway

1. **Открой [railway.app](https://railway.app)**
2. **New Project** → **Empty Project**
3. **Название**: `pomogator-bot-full`

### 2️⃣ Добавление сервиса бота

1. **New Service** → **GitHub Repo**
2. **Репозиторий**: `stepanboost/pomogator`
3. **Root Directory**: `apps/bot`
4. **Deploy**

### 3️⃣ Настройка переменных окружения

В **Settings → Variables** добавь:

```bash
# Основные настройки
NODE_ENV=production
BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
WEBAPP_URL=https://pomogator-production.up.railway.app
API_BASE_URL=https://pomogator-production.up.railway.app

# База данных (если используешь)
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway

# Redis (если используешь)
REDIS_URL=redis://redis.railway.internal:6379

# JWT секрет (минимум 32 символа)
JWT_SECRET=твой_супер_секретный_ключ_минимум_32_символа

# YooKassa (для платежей)
YK_SHOP_ID=твой_yookassa_shop_id
YK_SECRET_KEY=твой_yookassa_secret_key
YK_RETURN_URL=https://t.me/pomogator_school_bot?start=paid_
```

### 4️⃣ Настройка мини-приложения

1. **Открой [@BotFather](https://t.me/botfather)**
2. **Команда**: `/mybots`
3. **Выбери бота**: `@pomogator_school_bot`
4. **Bot Settings** → **Mini App**
5. **URL**: `https://pomogator-production.up.railway.app`

---

## ✅ Полный функционал бота

### 🎯 Основные возможности:

- ✅ **Команда /start** - приветствие и меню
- ✅ **Пробный период** - 3 дня бесплатно
- ✅ **Мини-приложение** - открытие веб-приложения
- ✅ **Туториал** - пошаговое обучение
- ✅ **Подписка** - покупка через YooKassa
- ✅ **Поддержка** - контакты и помощь
- ✅ **Планировщик** - уведомления и напоминания
- ✅ **API интеграция** - работа с бэкендом
- ✅ **Fallback режим** - работает даже без API

### 🔧 Технические особенности:

- **Умная обработка ошибок** - если API недоступен, использует mock данные
- **Таймауты** - не зависает при проблемах с сетью
- **Логирование** - подробные логи для отладки
- **Graceful shutdown** - корректное завершение работы
- **Webhook поддержка** - готов к масштабированию

---

## 🚀 После деплоя

### Тестирование:

1. **Найди бота**: `@pomogator_school_bot`
2. **Нажми** `/start`
3. **Активируй** пробный период
4. **Нажми** "🚀 Открыть приложение"
5. **Проверь** все функции

### Ожидаемое поведение:

- **Приветствие** с именем пользователя
- **Меню** с кнопками функций
- **Пробный период** активируется автоматически
- **Мини-приложение** открывается в Telegram
- **Туториал** показывает возможности
- **Поддержка** отвечает на вопросы

---

## 🔍 Мониторинг

### Логи Railway:

В **Deployments** → **View Logs** должно быть:

```
🚀 Запуск бота...
📊 Переменные окружения:
   BOT_TOKEN: ✅ Установлен
   WEBAPP_URL: https://pomogator-production.up.railway.app
   API_BASE_URL: https://pomogator-production.up.railway.app
⏰ Scheduler запущен
🤖 Bot успешно запущен!
```

### Ошибки:

- **BOT_TOKEN не найден** → проверь переменные
- **API недоступен** → нормально, используется fallback
- **Webhook ошибки** → проверь настройки BotFather

---

## 🎯 Результат

После настройки у тебя будет:

- ✅ **Полнофункциональный бот** на Railway
- ✅ **Интеграция с мини-приложением**
- ✅ **Система подписок и платежей**
- ✅ **Планировщик уведомлений**
- ✅ **API интеграция с fallback**
- ✅ **Профессиональная обработка ошибок**

**Готово к продакшену!** 🚀
