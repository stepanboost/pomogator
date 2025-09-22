import axios from 'axios'
import { createHmac } from 'crypto'
import { envSchema } from '@pomogator/shared'

const env = envSchema.parse(process.env)

export interface YooKassaPaymentRequest {
  amount: {
    value: string
    currency: string
  }
  description: string
  metadata?: Record<string, string>
  return_url?: string
}

export interface YooKassaPaymentResponse {
  id: string
  status: string
  amount: {
    value: string
    currency: string
  }
  description: string
  metadata?: Record<string, string>
  confirmation?: {
    type: string
    confirmation_url: string
  }
  created_at: string
  expires_at: string
}

export class YooKassaService {
  private baseURL = 'https://api.yookassa.ru/v3'
  private shopId: string
  private secretKey: string

  constructor() {
    this.shopId = env.YK_SHOP_ID
    this.secretKey = env.YK_SECRET_KEY
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64')
    return `Basic ${credentials}`
  }

  async createPayment(data: YooKassaPaymentRequest): Promise<YooKassaPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          amount: data.amount,
          description: data.description,
          metadata: data.metadata,
          confirmation: {
            type: 'redirect',
            return_url: data.return_url || env.YK_RETURN_URL
          },
          capture: true
        },
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
            'Idempotence-Key': `pomogator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('YooKassa create payment error:', error)
      throw new Error('Failed to create payment')
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('YooKassa get payment error:', error)
      throw new Error('Failed to get payment')
    }
  }

  async verifyWebhook(req: any): Promise<boolean> {
    try {
      // YooKassa webhook verification
      // This is a simplified version - implement according to YooKassa docs
      const signature = req.headers['x-yookassa-signature']
      if (!signature) return false

      // In production, implement proper signature verification
      // using the webhook secret from YooKassa
      return true
    } catch (error) {
      console.error('YooKassa webhook verification error:', error)
      return false
    }
  }
}
