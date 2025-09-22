import { z } from 'zod'

// Environment validation
export const envSchema = z.object({
  BOT_TOKEN: z.string().min(1),
  WEBAPP_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  YK_SHOP_ID: z.string().min(1),
  YK_SECRET_KEY: z.string().min(1),
  YK_RETURN_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  APP_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// JWT payload schema
export const jwtPayloadSchema = z.object({
  userId: z.string(),
  tgId: z.string(),
  iat: z.number(),
  exp: z.number(),
})

export type JWTPayload = z.infer<typeof jwtPayloadSchema>

// API request/response schemas
export const createPaymentSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('RUB'),
  description: z.string().optional(),
})

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>

export const paymentWebhookSchema = z.object({
  event: z.string(),
  type: z.string(),
  object: z.object({
    id: z.string(),
    status: z.enum(['pending', 'waiting_for_capture', 'succeeded', 'canceled']),
    amount: z.object({
      value: z.string(),
      currency: z.string(),
    }),
    metadata: z.record(z.string()).optional(),
  }),
})

export type PaymentWebhook = z.infer<typeof paymentWebhookSchema>

// Telegram Mini App init data validation
export const telegramInitDataSchema = z.object({
  query_id: z.string(),
  user: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    language_code: z.string().optional(),
  }),
  auth_date: z.number(),
  hash: z.string(),
})

export type TelegramInitData = z.infer<typeof telegramInitDataSchema>

// Bot command schemas
export const startTrialSchema = z.object({
  userId: z.string(),
})

export const cancelSubscriptionSchema = z.object({
  userId: z.string(),
})

// Event log types
export const eventLogSchema = z.object({
  type: z.enum([
    'trial_started',
    'trial_reminder',
    'trial_expired',
    'payment_created',
    'payment_succeeded',
    'payment_failed',
    'subscription_canceled',
    'app_opened',
    'tutorial_started',
    'tutorial_completed',
  ]),
  payload: z.record(z.any()).optional(),
})

export type EventLogType = z.infer<typeof eventLogSchema>['type']
