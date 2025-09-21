# 🚀 ИСПРАВЛЕННЫЙ ДЕПЛОЙ НА RAILWAY

## Проблемы исправлены:

1. ✅ **Упрощен Dockerfile** - убрана сложная многоэтапная сборка
2. ✅ **Убран standalone режим** - может вызывать проблемы с Railway
3. ✅ **Обновлен railway.json** - правильные настройки для Docker
4. ✅ **Исправлен healthcheck** - увеличен timeout до 300s

## Пошаговая инструкция:

### 1. Создание проекта в Railway
1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите репозиторий `stepanboost/pomogator`

### 2. Настройка переменных окружения
В разделе "Variables" добавьте:

```
OPENAI_API_KEY=ваш_openai_api_ключ
TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
NODE_ENV=production
```

### 3. Настройка Dockerfile (если нужно)
Если основной Dockerfile не работает:
1. Перейдите в "Settings" → "Build"
2. Установите "Dockerfile Path" на `Dockerfile.simple`

### 4. Ожидание деплоя
- Railway автоматически соберет Docker образ
- Процесс займет 5-10 минут
- Следите за логами в разделе "Deployments"

### 5. Получение URL
После успешного деплоя:
- Railway предоставит URL вида: `https://your-app-name.railway.app`
- Скопируйте этот URL

### 6. Настройка Telegram Bot
1. Перейдите в [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Установите URL от Railway

## Проверка работы:

1. **Откройте URL** - должна загрузиться главная страница
2. **Проверьте чат** - отправьте сообщение
3. **Проверьте загрузку файлов** - попробуйте загрузить изображение

## Если проблемы остаются:

1. **Проверьте логи** в Railway
2. **Убедитесь в правильности переменных** окружения
3. **Попробуйте простой Dockerfile** (`Dockerfile.simple`)
4. **Перезапустите деплой** в Railway

## Технические детали:

- **Dockerfile**: упрощенный, без многоэтапной сборки
- **Next.js**: без standalone режима
- **Healthcheck**: 300s timeout
- **Порт**: 3000 (автоматически)
