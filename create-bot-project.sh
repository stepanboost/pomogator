#!/bin/bash

echo "🤖 Создание проекта для бота на Railway..."

# Проверяем, что Railway CLI установлен
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Установите его:"
    echo "npm install -g @railway/cli"
    exit 1
fi

echo "🔐 Авторизация в Railway..."
echo "Откройте браузер для авторизации..."

# Создаем новый проект для бота
echo "📋 Создаем новый проект для бота..."
railway new --name pomogator-bot

echo "🚀 Деплоим бота..."
cd apps/bot
railway up --service bot

echo "✅ Проект для бота создан!"
echo ""
echo "📝 Не забудьте:"
echo "1. Настроить переменные окружения в Railway Dashboard"
echo "2. Получить URL'ы из проекта 1 (App)"
echo "3. Обновить WEBAPP_URL и API_BASE_URL в проекте 2 (Bot)"
echo ""
echo "🔗 Проекты:"
echo "- Проект 1 (App): 3a9aa4de-ed4f-4241-895b-f206482ab985"
echo "- Проект 2 (Bot): новый проект pomogator-bot"
