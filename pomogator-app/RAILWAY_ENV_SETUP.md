# 🔧 Настройка переменных окружения в Railway

## Обязательные переменные

Установите следующие переменные в настройках Railway:

### 1. OpenAI API Key
```
OPENAI_API_KEY=sk-proj-ваш_ключ_здесь
```
**Где взять:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 2. Telegram Bot Token
```
TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=7658944154:AAGpuLuBpxj0JJrcz2x32_tLpcvuFhyvblE
```
**Где взять:** [@BotFather](https://t.me/botfather) в Telegram

### 3. Environment
```
NODE_ENV=production
```

## Как добавить переменные в Railway:

1. **Откройте проект в Railway**
2. **Перейдите в "Variables"**
3. **Нажмите "New Variable"**
4. **Добавьте каждую переменную по отдельности**

## Проверка переменных:

После добавления всех переменных:
1. **Перезапустите деплой** (Railway сделает это автоматически)
2. **Проверьте логи** - не должно быть ошибок "Missing credentials"
3. **Откройте приложение** - должно работать без ошибок

## Важно:

- ✅ **Все переменные обязательны** - без них приложение не запустится
- ✅ **Скопируйте токены точно** - без лишних пробелов
- ✅ **NODE_ENV=production** - для правильной работы в продакшене
