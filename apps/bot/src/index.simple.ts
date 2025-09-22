import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN

// Проверяем наличие обязательных переменных
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!')
  process.exit(1)
}

console.log('🚀 Запуск простого бота...')
console.log(`📊 BOT_TOKEN: ${BOT_TOKEN ? '✅ Установлен' : '❌ Не установлен'}`)

// Create bot instance
const bot = new Telegraf(BOT_TOKEN)

// Start command
bot.start(async (ctx) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Открыть приложение', callback_data: 'open_app' },
          { text: '🎁 3 дня бесплатно', callback_data: 'start_trial' }
        ],
        [
          { text: '📘 Туториал', callback_data: 'start_tutorial' },
          { text: '💳 Купить подписку', callback_data: 'buy_subscription' }
        ],
        [
          { text: '🙅 Отмена подписки', callback_data: 'cancel_subscription' },
          { text: '👨‍💻 Поддержка', callback_data: 'support' }
        ]
      ]
    }
  }

  const message = `👋 Привет, ${ctx.from?.first_name}!\n\n` +
    `Добро пожаловать в Помогатор - твой AI-помощник для решения задач!\n\n` +
    `🔒 Для доступа к приложению активируйте пробный период или купите подписку\n\n` +
    `Выберите действие:`

  await ctx.reply(message, keyboard)
})

// Callback query handlers
bot.action('open_app', async (ctx) => {
  const WEBAPP_URL = process.env.WEBAPP_URL || 'https://pomogator-production.up.railway.app'
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Открыть приложение', web_app: { url: WEBAPP_URL } }]
      ]
    }
  }

  await ctx.reply('✅ У вас есть доступ! Нажмите кнопку ниже, чтобы открыть приложение:', keyboard)
  await ctx.answerCbQuery('✅ Приложение готово к открытию')
})

bot.action('start_trial', async (ctx) => {
  await ctx.reply('🎉 Пробный период активирован! Теперь у вас есть 3 дня бесплатного доступа.')
  await ctx.answerCbQuery('✅ Пробный период активирован')
})

bot.action('start_tutorial', async (ctx) => {
  await ctx.reply(
    '📘 Туториал\n\n' +
    'Помогатор - это AI-помощник, который поможет вам:\n\n' +
    '• Решать математические задачи\n' +
    '• Объяснять сложные концепции\n' +
    '• Помогать с программированием\n' +
    '• Анализировать документы\n\n' +
    'Просто задайте вопрос или загрузите файл!'
  )
  await ctx.answerCbQuery('📘 Туториал показан')
})

bot.action('buy_subscription', async (ctx) => {
  await ctx.reply(
    '💳 Покупка подписки\n\n' +
    'Подписка стоит 999 рублей в месяц.\n\n' +
    'Для покупки обратитесь к администратору: @stepanboost'
  )
  await ctx.answerCbQuery('💳 Информация о подписке')
})

bot.action('cancel_subscription', async (ctx) => {
  await ctx.reply(
    '🙅 Отмена подписки\n\n' +
    'Для отмены подписки обратитесь к администратору: @stepanboost'
  )
  await ctx.answerCbQuery('🙅 Информация об отмене')
})

bot.action('support', async (ctx) => {
  await ctx.reply(
    '👨‍💻 Поддержка\n\n' +
    'Если у вас возникли вопросы или проблемы, обратитесь к нашей службе поддержки:\n\n' +
    '📧 Email: support@pomogator.ru\n' +
    '💬 Telegram: @stepanboost\n\n' +
    'Мы ответим в течение 24 часов!'
  )
  await ctx.answerCbQuery('📞 Контакты поддержки')
})

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
})

// Start bot
async function start() {
  try {
    await bot.launch()
    console.log('🤖 Простой бот успешно запущен!')
    
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
    console.error('❌ Ошибка при запуске бота:', error)
    process.exit(1)
  }
}

start()
