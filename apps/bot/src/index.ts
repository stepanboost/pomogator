import { Telegraf, Scenes, session } from 'telegraf'
import dotenv from 'dotenv'
import { BotService } from './services/botService'
import { SchedulerService } from './services/schedulerService'
import { tutorialScene } from './scenes/tutorialScene'

// Load environment variables
dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

// Проверяем наличие обязательных переменных
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!')
  process.exit(1)
}

// Create bot instance
const bot = new Telegraf(BOT_TOKEN)

// Create stage for scenes
const stage = new Scenes.Stage([tutorialScene])

// Middleware
bot.use(session())
bot.use(stage.middleware())

// Initialize services
const botService = new BotService(API_BASE_URL)
const schedulerService = new SchedulerService(bot, botService)

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    // Find or create user
    const user = await botService.findOrCreateUser({
      tgId: userId,
      username: ctx.from.username,
      firstName: ctx.from.first_name
    })

    if (!user) {
      await ctx.reply('❌ Ошибка при создании пользователя')
      return
    }

    // Check user access
    const access = await botService.checkUserAccess(user.id)
    
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

    let message = `👋 Привет, ${ctx.from.first_name}!\n\n`
    message += `Добро пожаловать в Помогатор - твой AI-помощник для решения задач!\n\n`
    
    if (access.hasAccess) {
      message += `✅ У вас есть доступ до ${access.expiresAt?.toLocaleDateString('ru-RU')}\n\n`
    } else {
      message += `🔒 Для доступа к приложению активируйте пробный период или купите подписку\n\n`
    }
    
    message += `Выберите действие:`

    await ctx.reply(message, keyboard)
  } catch (error) {
    console.error('Start command error:', error)
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
  }
})

// Callback query handlers
bot.action('open_app', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const user = await botService.findOrCreateUser({
      tgId: userId,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name
    })

    if (!user) {
      await ctx.answerCbQuery('❌ Ошибка при получении данных пользователя')
      return
    }

    const access = await botService.checkUserAccess(user.id)
    
    if (!access.hasAccess) {
      await ctx.answerCbQuery('❌ У вас нет доступа к приложению')
      await ctx.reply('🔒 Для доступа к приложению активируйте пробный период или купите подписку')
      return
    }

    // Generate JWT token and open web app
    const token = await botService.generateUserToken(user.id, user.tgId)
    const webAppUrl = `${WEBAPP_URL}?token=${token}`

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }]
        ]
      }
    }

    await ctx.reply('✅ У вас есть доступ! Нажмите кнопку ниже, чтобы открыть приложение:', keyboard)
    await ctx.answerCbQuery('✅ Приложение готово к открытию')
  } catch (error) {
    console.error('Open app error:', error)
    await ctx.answerCbQuery('❌ Ошибка при открытии приложения')
  }
})

bot.action('start_trial', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const user = await botService.findOrCreateUser({
      tgId: userId,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name
    })

    if (!user) {
      await ctx.answerCbQuery('❌ Ошибка при получении данных пользователя')
      return
    }

    const result = await botService.startTrial(user.id)
    
    if (result.success) {
      await ctx.reply(`🎉 ${result.message}`)
      await ctx.answerCbQuery('✅ Пробный период активирован')
    } else {
      await ctx.reply(`❌ ${result.message}`)
      await ctx.answerCbQuery('❌ Не удалось активировать пробный период')
    }
  } catch (error) {
    console.error('Start trial error:', error)
    await ctx.answerCbQuery('❌ Ошибка при активации пробного периода')
  }
})

bot.action('start_tutorial', async (ctx) => {
  await ctx.scene.enter('tutorial')
  await ctx.answerCbQuery('📘 Начинаем туториал')
})

bot.action('buy_subscription', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const user = await botService.findOrCreateUser({
      tgId: userId,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name
    })

    if (!user) {
      await ctx.answerCbQuery('❌ Ошибка при получении данных пользователя')
      return
    }

    const payment = await botService.createPayment(user.id, 999) // 999 RUB
    
    if (payment) {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Оплатить', url: payment.paymentUrl }],
            [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
          ]
        }
      }

      await ctx.reply(
        `💳 Создан платеж на сумму ${payment.amount} ${payment.currency}\n\n` +
        `Нажмите кнопку ниже для оплаты:`,
        keyboard
      )
      await ctx.answerCbQuery('✅ Платеж создан')
    } else {
      await ctx.reply('❌ Ошибка при создании платежа')
      await ctx.answerCbQuery('❌ Ошибка при создании платежа')
    }
  } catch (error) {
    console.error('Buy subscription error:', error)
    await ctx.answerCbQuery('❌ Ошибка при создании платежа')
  }
})

bot.action('cancel_subscription', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const user = await botService.findOrCreateUser({
      tgId: userId,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name
    })

    if (!user) {
      await ctx.answerCbQuery('❌ Ошибка при получении данных пользователя')
      return
    }

    const result = await botService.cancelSubscription(user.id)
    
    await ctx.reply(result.message)
    await ctx.answerCbQuery(result.success ? '✅ Подписка отменена' : '❌ Ошибка при отмене подписки')
  } catch (error) {
    console.error('Cancel subscription error:', error)
    await ctx.answerCbQuery('❌ Ошибка при отмене подписки')
  }
})

bot.action('support', async (ctx) => {
  await ctx.reply(
    '👨‍💻 Поддержка\n\n' +
    'Если у вас возникли вопросы или проблемы, обратитесь к нашей службе поддержки:\n\n' +
    '📧 Email: support@pomogator.ru\n' +
    '💬 Telegram: @pomogator_support\n\n' +
    'Мы ответим в течение 24 часов!'
  )
  await ctx.answerCbQuery('📞 Контакты поддержки')
})

bot.action('back_to_main', async (ctx) => {
  await ctx.scene.leave()
  // Trigger start command
  await ctx.start()
})

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
})

// Start bot and scheduler
async function start() {
  try {
    console.log('🚀 Запуск бота...')
    console.log('📊 Переменные окружения:')
    console.log(`   BOT_TOKEN: ${BOT_TOKEN ? '✅ Установлен' : '❌ Не установлен'}`)
    console.log(`   WEBAPP_URL: ${WEBAPP_URL}`)
    console.log(`   API_BASE_URL: ${API_BASE_URL}`)
    
    // Start scheduler for user warming
    schedulerService.start()
    console.log('⏰ Scheduler запущен')
    
    // Start bot
    await bot.launch()
    console.log('🤖 Bot успешно запущен!')
    
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
