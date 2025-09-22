# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ ДЕПЛОЯ

## Проблема решена! ✅
Railway не позволяет деплоить один GitHub репозиторий несколько раз в один проект.

## Решение: 2 отдельных проекта

### 📱 Проект 1: Pomogator App
**ID**: `3a9aa4de-ed4f-4241-895b-f206482ab985` (уже есть)

**Сервисы:**
- ✅ PostgreSQL (уже есть)
- ✅ Redis (уже есть)
- 🌐 Frontend (Next.js) - добавить
- 🔧 API (Express) - добавить

### 🤖 Проект 2: Pomogator Bot
**Новый проект** (создать)

**Сервисы:**
- 🤖 Bot (Telegram) - добавить

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1️⃣ Деплой проекта 1 (App)

#### Открой проект 1:
- [railway.app](https://railway.app) → проект `3a9aa4de-ed4f-4241-895b-f206482ab985`

#### Добавь Frontend:
1. **New Service** → **GitHub Repo**
2. Репозиторий: `stepanboost/pomogator`
3. **Root Directory**: `pomogator-app`
4. **Deploy**

#### Добавь API:
1. **New Service** → **GitHub Repo**
2. Репозиторий: `stepanboost/pomogator`
3. **Root Directory**: `apps/api`
4. **Deploy**

#### Настрой переменные:
**Frontend:**
```
NODE_ENV=production
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=твой_токен
OPENAI_API_KEY=твой_ключ
```

**API:**
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
REDIS_URL=redis://redis.railway.internal:6379
BOT_TOKEN=твой_токен
WEBAPP_URL=https://твой-frontend-url.railway.app
API_BASE_URL=https://твой-api-url.railway.app
JWT_SECRET=твой_секрет_32_символа
YK_SHOP_ID=твой_yookassa_shop_id
YK_SECRET_KEY=твой_yookassa_secret_key
YK_RETURN_URL=https://t.me/твой_бот?start=paid_
APP_BASE_URL=https://твой-api-url.railway.app
```

### 2️⃣ Деплой проекта 2 (Bot)

#### Создай новый проект:
1. [railway.app](https://railway.app) → **New Project**
2. **Empty Project**
3. Название: `pomogator-bot`

#### Добавь Bot:
1. **New Service** → **GitHub Repo**
2. Репозиторий: `stepanboost/pomogator`
3. **Root Directory**: `apps/bot`
4. **Deploy**

#### Настрой переменные:
**Bot:**
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
REDIS_URL=redis://redis.railway.internal:6379
BOT_TOKEN=твой_токен
WEBAPP_URL=https://твой-frontend-url.railway.app
API_BASE_URL=https://твой-api-url.railway.app
JWT_SECRET=твой_секрет_32_символа
```

---

## ⚠️ ВАЖНО

1. **Сначала деплой проект 1** (App)
2. **Получи URL'ы** Frontend и API из проекта 1
3. **Обнови переменные** `WEBAPP_URL` и `API_BASE_URL` в API
4. **Потом деплой проект 2** (Bot)
5. **Обнови переменные** `WEBAPP_URL` и `API_BASE_URL` в Bot

---

## 🔗 Связь между проектами

- **Bot** (проект 2) подключается к **API** (проект 1)
- **Bot** (проект 2) показывает **Frontend** (проект 1)
- **API** и **Bot** используют одну **базу данных** (PostgreSQL)
- **API** и **Bot** используют один **Redis**

---

## ✅ Результат

- 📱 **Проект 1**: Frontend + API + PostgreSQL + Redis
- 🤖 **Проект 2**: Bot (подключается к API из проекта 1)

## 🎯 Время деплоя: ~5 минут

---

## 📁 Созданные файлы:

- `TWO_PROJECTS_DEPLOY.md` - общая инструкция
- `PROJECT_1_APP.md` - инструкция для проекта 1
- `PROJECT_2_BOT.md` - инструкция для проекта 2
- `create-bot-project.sh` - скрипт создания проекта 2
