import { Scenes } from 'telegraf'
import { BotService } from '../services/botService'

const tutorialScene = new Scenes.BaseScene<Scenes.SceneContext>('tutorial')

tutorialScene.enter(async (ctx) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ Начать туториал', callback_data: 'tutorial_step_1' }],
        [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
      ]
    }
  }

  await ctx.reply(
    '📘 Добро пожаловать в туториал!\n\n' +
    'Здесь вы узнаете, как пользоваться Помогатором:\n\n' +
    '• Как задавать вопросы\n' +
    '• Как загружать файлы\n' +
    '• Как использовать все возможности\n\n' +
    'Готовы начать?',
    keyboard
  )
})

tutorialScene.action('tutorial_step_1', async (ctx) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ Далее', callback_data: 'tutorial_step_2' }],
        [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
      ]
    }
  }

  await ctx.editMessageText(
    '📝 Шаг 1: Задавайте вопросы\n\n' +
    'Просто напишите свой вопрос в чат, и Помогатор даст вам подробный ответ.\n\n' +
    'Примеры вопросов:\n' +
    '• "Как решить квадратное уравнение?"\n' +
    '• "Объясни закон Ома"\n' +
    '• "Помоги с программированием на Python"',
    keyboard
  )
})

tutorialScene.action('tutorial_step_2', async (ctx) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ Далее', callback_data: 'tutorial_step_3' }],
        [{ text: '◀️ Назад', callback_data: 'tutorial_step_1' }]
      ]
    }
  }

  await ctx.editMessageText(
    '📎 Шаг 2: Загружайте файлы\n\n' +
    'Вы можете загружать документы, изображения и другие файлы для анализа:\n\n' +
    '• PDF документы\n' +
    '• Изображения с текстом\n' +
    '• Текстовые файлы\n\n' +
    'Помогатор проанализирует содержимое и ответит на ваши вопросы!',
    keyboard
  )
})

tutorialScene.action('tutorial_step_3', async (ctx) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ Далее', callback_data: 'tutorial_step_4' }],
        [{ text: '◀️ Назад', callback_data: 'tutorial_step_2' }]
      ]
    }
  }

  await ctx.editMessageText(
    '🎯 Шаг 3: Используйте все возможности\n\n' +
    'Помогатор умеет:\n\n' +
    '• Решать математические задачи\n' +
    '• Объяснять сложные концепции\n' +
    '• Помогать с программированием\n' +
    '• Анализировать документы\n' +
    '• И многое другое!\n\n' +
    'Не стесняйтесь экспериментировать!',
    keyboard
  )
})

tutorialScene.action('tutorial_step_4', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (userId) {
    // Log tutorial completion
    const botService = new BotService(process.env.API_BASE_URL || '')
    try {
      const user = await botService.findOrCreateUser({
        tgId: userId,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name
      })
      
      if (user) {
        await botService.logEvent(user.id, 'tutorial_completed')
      }
    } catch (error) {
      console.error('Error logging tutorial completion:', error)
    }
  }

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Открыть приложение', callback_data: 'open_app' }],
        [{ text: '🎁 3 дня бесплатно', callback_data: 'start_trial' }],
        [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
      ]
    }
  }

  await ctx.editMessageText(
    '🎉 Поздравляем! Вы завершили туториал!\n\n' +
    'Теперь вы знаете, как пользоваться Помогатором.\n\n' +
    'Готовы начать? Выберите действие:',
    keyboard
  )
})

tutorialScene.action('back_to_main', async (ctx) => {
  await ctx.scene.leave()
  // Trigger start command
  await ctx.start()
})

export { tutorialScene }
