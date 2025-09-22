import axios from 'axios'
import { createHmac } from 'crypto'

export interface User {
  id: string
  tgId: string
  username?: string
  firstName?: string
}

export interface Access {
  hasAccess: boolean
  status: string
  expiresAt?: Date
}

export interface Payment {
  paymentId: string
  invoiceId: string
  paymentUrl: string
  amount: number
  currency: string
  status: string
}

export class BotService {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  async findOrCreateUser(userData: {
    tgId: string
    username?: string
    firstName?: string
  }): Promise<User | null> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/users`, userData)
      return response.data
    } catch (error) {
      console.error('Find or create user error:', error)
      // Fallback to mock user if API is not available
      return {
        id: `user_${userData.tgId}`,
        tgId: userData.tgId,
        username: userData.username,
        firstName: userData.firstName
      }
    }
  }

  async checkUserAccess(userId: string): Promise<Access> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/${userId}/access`)
      return response.data
    } catch (error) {
      console.error('Check user access error:', error)
      // Fallback to mock access if API is not available
      return { 
        hasAccess: true, 
        status: 'TRIAL',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    }
  }

  async startTrial(userId: string): Promise<{ success: boolean; message: string; trialEndsAt?: Date }> {
    try {
      // Mock trial activation
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      return {
        success: true,
        message: `Пробный период активирован до ${trialEndsAt.toLocaleDateString('ru-RU')}`,
        trialEndsAt
      }
    } catch (error) {
      console.error('Start trial error:', error)
      return { success: false, message: 'Ошибка при активации пробного периода' }
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string; deactivationDate?: Date }> {
    try {
      // Mock subscription cancellation
      return {
        success: true,
        message: 'Подписка отменена. Доступ будет действовать до конца текущего периода.'
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return { success: false, message: 'Ошибка при отмене подписки' }
    }
  }

  async createPayment(userId: string, amount: number): Promise<Payment | null> {
    try {
      // Mock payment creation
      return {
        paymentId: `pay_${Date.now()}`,
        invoiceId: `inv_${Date.now()}`,
        paymentUrl: 'https://yoomoney.ru/checkout/payments/v2/show?orderId=mock_payment',
        amount: amount,
        currency: 'RUB',
        status: 'PENDING'
      }
    } catch (error) {
      console.error('Create payment error:', error)
      return null
    }
  }

  async generateUserToken(userId: string, tgId: string): Promise<string> {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    
    // Simple JWT generation
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const payload = {
      userId,
      tgId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    
    const signature = createHmac('sha256', jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  async logEvent(userId: string, type: string, payload?: Record<string, any>): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/events/log`, {
        userId,
        type,
        payload
      })
    } catch (error) {
      console.error('Log event error:', error)
    }
  }

  async sendMessage(userId: string, message: string, keyboard?: any): Promise<boolean> {
    try {
      // This would be implemented to send messages via Telegram Bot API
      // For now, we'll just log it
      console.log(`Sending message to user ${userId}: ${message}`)
      return true
    } catch (error) {
      console.error('Send message error:', error)
      return false
    }
  }
}
