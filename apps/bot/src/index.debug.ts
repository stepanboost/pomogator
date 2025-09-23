import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🔍 ДИАГНОСТИКА БОТА НА RAILWAY')
console.log('=====================================')

const BOT_TOKEN = process.env.BOT_TOKEN
const WEBAPP_URL = process.env.WEBAPP_URL
const API_BASE_URL = process.env.API_BASE_URL
const NODE_ENV = process.env.NODE_ENV

console.log('📊 Переменные окружения:')
console.log(`   NODE_ENV: ${NODE_ENV}`)
console.log(`   BOT_TOKEN: ${BOT_TOKEN ? '✅ Установлен (' + BOT_TOKEN.substring(0, 10) + '...)' : '❌ НЕ УСТАНОВЛЕН'}`)
console.log(`   WEBAPP_URL: ${WEBAPP_URL || '❌ НЕ УСТАНОВЛЕН'}`)
console.log(`   API_BASE_URL: ${API_BASE_URL || '❌ НЕ УСТАНОВЛЕН'}`)
console.log('')

if (!BOT_TOKEN) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: BOT_TOKEN не найден!')
  console.error('📋 Проверьте переменные окружения в Railway Dashboard')
  process.exit(1)
}

console.log('🤖 Создание экземпляра бота...')
const bot = new Telegraf(BOT_TOKEN)

// Проверка токена через getMe
async function checkToken() {
  try {
    console.log('🔍 Проверка токена через getMe...')
    const botInfo = await bot.telegram.getMe()
    console.log('✅ Токен валидный!')
    console.log(`   ID: ${botInfo.id}`)
    console.log(`   Username: @${botInfo.username}`)
    console.log(`   Name: ${botInfo.first_name}`)
    return true
  } catch (error) {
    console.error('❌ Ошибка при проверке токена:', error.message)
    return false
  }
}

// Простой обработчик start
bot.start(async (ctx) => {
  console.log(`📨 /start от пользователя ${ctx.from?.id} (@${ctx.from?.username})`)
  
  const message = `🤖 Диагностический бот работает!\n\n` +
    `✅ Токен: Валидный\n` +
    `✅ Сервер: Запущен\n` +
    `✅ Обработчики: Активны\n\n` +
    `Попробуйте написать любое сообщение!`
  
  await ctx.reply(message)
})

// Обработчик всех текстовых сообщений
bot.on('text', async (ctx) => {
  console.log(`📨 Сообщение от ${ctx.from?.id}: "${ctx.message.text}"`)
  
  const response = `✅ Получено: "${ctx.message.text}"\n\n` +
    `Диагностический бот работает корректно!`
  
  await ctx.reply(response)
})

// Обработчик callback queries
bot.action('test', async (ctx) => {
  console.log('📨 Callback query "test" получен')
  await ctx.answerCbQuery('✅ Callback работает!')
  await ctx.reply('✅ Callback queries работают корректно!')
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('❌ Ошибка в боте:', err)
  if (ctx) {
    ctx.reply('❌ Произошла ошибка в боте').catch(console.error)
  }
})

// Запуск бота
async function start() {
  try {
    console.log('🚀 Запуск диагностического бота...')
    
    // Проверяем токен
    const tokenValid = await checkToken()
    if (!tokenValid) {
      console.error('❌ Не удалось запустить бота - неверный токен')
      process.exit(1)
    }
    
    // Запускаем бота
    await bot.launch()
    console.log('✅ Диагностический бот успешно запущен!')
    console.log('📋 Теперь можете протестировать бота в Telegram')
    console.log('')
    
    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('🛑 Получен SIGINT, завершаем работу...')
      bot.stop('SIGINT')
    })
    process.once('SIGTERM', () => {
      console.log('🛑 Получен SIGTERM, завершаем работу...')
      bot.stop('SIGTERM')
    })
    
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при запуске бота:', error)
    console.error('📋 Детали ошибки:', error.message)
    process.exit(1)
  }
}

start()
