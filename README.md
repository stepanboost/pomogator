# Помогатор - Универсальный академический помощник

Telegram Mini App для решения учебных задач с поддержкой изображений и PDF файлов.

## Возможности

- 🤖 ИИ-помощник на базе OpenAI GPT-4o
- 📸 Загрузка и анализ изображений
- 📄 Обработка PDF файлов
- 💬 Интерактивный чат
- 📚 История диалогов
- 🎨 Современный UI с поддержкой LaTeX

## Технологии

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o
- **Math**: KaTeX для рендеринга формул
- **PDF**: pdf-parse для извлечения текста
- **Deploy**: Railway

## Переменные окружения

```bash
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Деплой на Railway

1. Подключите репозиторий к Railway
2. Установите переменные окружения
3. Railway автоматически соберет и задеплоит приложение

## Локальная разработка

```bash
npm install
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000