#!/bin/bash

echo "🚀 Начинаем деплой проекта Pomogator на Railway..."

# Проверяем, что Railway CLI установлен
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Установите его:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Проверяем авторизацию
if ! railway whoami &> /dev/null; then
    echo "🔐 Авторизуйтесь в Railway:"
    railway login
fi

echo "📋 Создаем проект в Railway..."
railway new --name pomogator

echo "🗄️ Добавляем PostgreSQL..."
railway add postgresql

echo "🔴 Добавляем Redis..."
railway add redis

echo "🌐 Деплоим Frontend (Next.js)..."
cd pomogator-app
railway up --service frontend
cd ..

echo "🔧 Деплоим API..."
cd apps/api
railway up --service api
cd ../..

echo "🤖 Деплоим Bot..."
cd apps/bot
railway up --service bot
cd ../..

echo "✅ Деплой завершен!"
echo ""
echo "📝 Не забудьте настроить переменные окружения:"
echo "1. Откройте Railway Dashboard"
echo "2. Перейдите в каждый сервис"
echo "3. Добавьте переменные из railway-deploy-guide.md"
echo ""
echo "🔗 Получите URL'ы сервисов:"
railway status
