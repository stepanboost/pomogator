# Деплой на Railway

## Шаги для деплоя:

### 1. Подключение к Railway
1. Перейдите на [railway.app](https://railway.app)
2. Войдите в аккаунт (можно через GitHub)
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий `stepanboost/pomogator`

### 2. Настройка переменных окружения
В настройках проекта добавьте следующие переменные:

```
OPENAI_API_KEY=your_openai_api_key_here
TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
NODE_ENV=production
```

### 3. Настройка деплоя
- Railway автоматически определит, что это Next.js приложение
- Используется `Dockerfile` для сборки
- Порт: 3000 (автоматически)
- Команда запуска: `npm start`

### 4. Получение URL
После деплоя Railway предоставит URL вида:
`https://your-app-name.railway.app`

### 5. Настройка Telegram Bot
1. Перейдите в [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Установите URL: `https://your-app-name.railway.app`

### 6. Проверка работы
1. Откройте бота в Telegram
2. Нажмите на кнопку меню
3. Должно открыться приложение

## Структура проекта

```
pomogator-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── answer/route.ts    # API для OpenAI
│   │   │   └── upload/route.ts    # API для загрузки файлов
│   │   ├── chat/page.tsx          # Страница чата
│   │   ├── history/page.tsx       # Страница истории
│   │   └── page.tsx               # Главная страница
│   ├── components/
│   │   ├── ChatBubble.tsx         # Компонент сообщения
│   │   ├── ChatInput.tsx          # Компонент ввода
│   │   └── Header.tsx             # Заголовок
│   └── lib/
│       ├── telegram.ts            # Telegram WebApp SDK
│       ├── pdf.ts                 # Обработка PDF
│       └── history.ts             # Управление историей
├── Dockerfile                     # Конфигурация Docker
├── railway.json                   # Конфигурация Railway
└── package.json                   # Зависимости
```

## Возможные проблемы

1. **Ошибка сборки**: Проверьте, что все зависимости установлены
2. **Ошибка переменных**: Убедитесь, что все переменные окружения установлены
3. **Ошибка Telegram**: Проверьте правильность токена бота

## Логи
Для просмотра логов в Railway:
1. Откройте проект
2. Перейдите в "Deployments"
3. Выберите последний деплой
4. Нажмите "View Logs"
