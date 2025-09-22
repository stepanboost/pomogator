#!/bin/bash

echo "🤖 Деплой бота на Railway..."

# Проверяем, что мы в правильной директории
if [ ! -f "apps/bot/package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Проверяем, что git настроен
if [ ! -d ".git" ]; then
    echo "❌ Ошибка: Git не инициализирован"
    exit 1
fi

echo "📦 Подготавливаем файлы для деплоя..."

# Добавляем все изменения
git add .

# Коммитим изменения
git commit -m "Deploy bot to Railway" || echo "ℹ️  Нет изменений для коммита"

# Пушим в репозиторий
echo "🚀 Отправляем в GitHub..."
git push origin main

echo "✅ Деплой инициирован!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Открой railway.app"
echo "2. Создай новый проект 'pomogator-bot'"
echo "3. Добавь сервис из GitHub репозитория"
echo "4. Укажи Root Directory: apps/bot"
echo "5. Настрой переменные окружения"
echo "6. Проверь работу бота"
echo ""
echo "📖 Подробная инструкция: BOT_DEPLOY_GUIDE.md"
