import { Telegraf } from 'telegraf'
import cron from 'node-cron'
import { BotService } from './botService'

export class SchedulerService {
  private bot: Telegraf
  private botService: BotService

  constructor(bot: Telegraf, botService: BotService) {
    this.bot = bot
    this.botService = botService
  }

  start() {
    console.log('⏰ Starting scheduler service...')

    // Check for expiring trials every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkExpiringTrials()
    })

    // Check for expired trials every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.checkExpiredTrials()
    })

    // Check for pending payments every 2 hours
    cron.schedule('0 */2 * * *', async () => {
      await this.checkPendingPayments()
    })

    console.log('✅ Scheduler service started')
  }

  private async checkExpiringTrials() {
    try {
      console.log('🔍 Checking expiring trials...')
      
      // This would call the API to get users with expiring trials
      // For now, we'll implement a simple check
      const expiringUsers = await this.getExpiringTrials()
      
      for (const userId of expiringUsers) {
        await this.sendTrialReminder(userId)
      }
      
      console.log(`📧 Sent ${expiringUsers.length} trial reminders`)
    } catch (error) {
      console.error('Error checking expiring trials:', error)
    }
  }

  private async checkExpiredTrials() {
    try {
      console.log('🔍 Checking expired trials...')
      
      const expiredUsers = await this.getExpiredTrials()
      
      for (const userId of expiredUsers) {
        await this.sendTrialExpiredMessage(userId)
      }
      
      console.log(`📧 Sent ${expiredUsers.length} trial expired messages`)
    } catch (error) {
      console.error('Error checking expired trials:', error)
    }
  }

  private async checkPendingPayments() {
    try {
      console.log('🔍 Checking pending payments...')
      
      const pendingPayments = await this.getPendingPayments()
      
      for (const payment of pendingPayments) {
        await this.sendPaymentReminder(payment.userId, payment.paymentId)
      }
      
      console.log(`📧 Sent ${pendingPayments.length} payment reminders`)
    } catch (error) {
      console.error('Error checking pending payments:', error)
    }
  }

  private async getExpiringTrials(): Promise<string[]> {
    try {
      // This would call the API to get users with expiring trials
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting expiring trials:', error)
      return []
    }
  }

  private async getExpiredTrials(): Promise<string[]> {
    try {
      // This would call the API to get users with expired trials
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting expired trials:', error)
      return []
    }
  }

  private async getPendingPayments(): Promise<{ userId: string; paymentId: string }[]> {
    try {
      // This would call the API to get pending payments
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting pending payments:', error)
      return []
    }
  }

  private async sendTrialReminder(userId: string) {
    try {
      const message = 
        '⏰ Напоминание о пробном периоде\n\n' +
        'Ваш пробный период заканчивается через 6 часов!\n\n' +
        'Не упустите возможность продолжить пользоваться Помогатором со скидкой 10%!\n\n' +
        'Промокод: TRIAL10'

      const keyboard = {
        inline_keyboard: [
          [{ text: '💳 Купить со скидкой', callback_data: 'buy_subscription' }],
          [{ text: '🚀 Открыть приложение', callback_data: 'open_app' }]
        ]
      }

      await this.botService.sendMessage(userId, message, keyboard)
      await this.botService.logEvent(userId, 'trial_reminder')
    } catch (error) {
      console.error('Error sending trial reminder:', error)
    }
  }

  private async sendTrialExpiredMessage(userId: string) {
    try {
      const message = 
        '⏰ Пробный период закончился\n\n' +
        'Спасибо за использование Помогатора!\n\n' +
        'Чтобы продолжить пользоваться всеми возможностями, оформите подписку:'

      const keyboard = {
        inline_keyboard: [
          [{ text: '💳 Купить подписку', callback_data: 'buy_subscription' }],
          [{ text: '📘 Туториал', callback_data: 'start_tutorial' }]
        ]
      }

      await this.botService.sendMessage(userId, message, keyboard)
      await this.botService.logEvent(userId, 'trial_expired')
    } catch (error) {
      console.error('Error sending trial expired message:', error)
    }
  }

  private async sendPaymentReminder(userId: string, paymentId: string) {
    try {
      const message = 
        '💳 Напоминание об оплате\n\n' +
        'У вас есть неоплаченный платеж.\n\n' +
        'Нажмите кнопку ниже, чтобы завершить оплату:'

      const keyboard = {
        inline_keyboard: [
          [{ text: '💳 Оплатить', callback_data: `pay_${paymentId}` }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }

      await this.botService.sendMessage(userId, message, keyboard)
      await this.botService.logEvent(userId, 'payment_reminder', { paymentId })
    } catch (error) {
      console.error('Error sending payment reminder:', error)
    }
  }
}
