# 🚀 Деплой на Railway

## Быстрый старт

### 1. Подключение к Railway
1. Перейдите на [railway.app](https://railway.app)
2. Войдите в аккаунт (можно через GitHub)
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий `stepanboost/pomogator`

### 2. Настройка переменных окружения
В настройках проекта добавьте следующие переменные:

```
OPENAI_API_KEY=ваш_openai_api_ключ
TELEGRAM_BOT_TOKEN=ваш_telegram_bot_токен
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=ваш_telegram_bot_токен
NODE_ENV=production
```

### 3. Получение URL
После деплоя Railway предоставит URL вида:
`https://your-app-name.railway.app`

### 4. Настройка Telegram Bot
1. Перейдите в [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Установите URL от Railway

## Технические детали

- **Платформа**: Railway
- **Контейнер**: Docker
- **Node.js**: 18-alpine
- **Порт**: 3000
- **Команда запуска**: `npm start`

## Возможные проблемы

1. **Ошибка сборки**: Проверьте переменные окружения
2. **Ошибка Telegram**: Проверьте правильность токена бота
3. **Ошибка Docker**: Убедитесь, что `package-lock.json` актуален

## Логи
Для просмотра логов в Railway:
1. Откройте проект
2. Перейдите в "Deployments"
3. Выберите последний деплой
4. Нажмите "View Logs"
