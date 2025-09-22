import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN

console.log('🔍 Диагностика бота...')
console.log(`📊 NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`📊 BOT_TOKEN: ${BOT_TOKEN ? '✅ Установлен' : '❌ Не установлен'}`)
console.log(`📊 WEBAPP_URL: ${process.env.WEBAPP_URL}`)

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден!')
  process.exit(1)
}

// Create bot instance
const bot = new Telegraf(BOT_TOKEN)

// Простейший обработчик start
bot.start((ctx) => {
  console.log('📨 Получена команда /start от пользователя:', ctx.from?.id)
  ctx.reply('✅ Бот работает! Команда /start получена.')
})

// Обработчик всех текстовых сообщений
bot.on('text', (ctx) => {
  console.log('📨 Получено сообщение:', ctx.message.text)
  ctx.reply(`Вы написали: ${ctx.message.text}`)
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('❌ Ошибка бота:', err)
  ctx.reply('❌ Произошла ошибка в боте')
})

// Запуск бота
async function start() {
  try {
    console.log('🚀 Запуск тестового бота...')
    
    // Проверяем токен через getMe
    const botInfo = await bot.telegram.getMe()
    console.log('🤖 Информация о боте:', botInfo)
    
    await bot.launch()
    console.log('✅ Тестовый бот запущен успешно!')
    
    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('🛑 Остановка бота...')
      bot.stop('SIGINT')
    })
    process.once('SIGTERM', () => {
      console.log('🛑 Остановка бота...')
      bot.stop('SIGTERM')
    })
  } catch (error) {
    console.error('❌ Ошибка при запуске тестового бота:', error)
    process.exit(1)
  }
}

start()
