"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventLogSchema = exports.cancelSubscriptionSchema = exports.startTrialSchema = exports.telegramInitDataSchema = exports.paymentWebhookSchema = exports.createPaymentSchema = exports.jwtPayloadSchema = exports.envSchema = void 0;
const zod_1 = require("zod");
// Environment validation
exports.envSchema = zod_1.z.object({
    BOT_TOKEN: zod_1.z.string().min(1),
    WEBAPP_URL: zod_1.z.string().url(),
    API_BASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    YK_SHOP_ID: zod_1.z.string().min(1),
    YK_SECRET_KEY: zod_1.z.string().min(1),
    YK_RETURN_URL: zod_1.z.string().url(),
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().url(),
    APP_BASE_URL: zod_1.z.string().url(),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
// JWT payload schema
exports.jwtPayloadSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    tgId: zod_1.z.string(),
    iat: zod_1.z.number(),
    exp: zod_1.z.number(),
});
// API request/response schemas
exports.createPaymentSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().default('RUB'),
    description: zod_1.z.string().optional(),
});
exports.paymentWebhookSchema = zod_1.z.object({
    event: zod_1.z.string(),
    type: zod_1.z.string(),
    object: zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z.enum(['pending', 'waiting_for_capture', 'succeeded', 'canceled']),
        amount: zod_1.z.object({
            value: zod_1.z.string(),
            currency: zod_1.z.string(),
        }),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
    }),
});
// Telegram Mini App init data validation
exports.telegramInitDataSchema = zod_1.z.object({
    query_id: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.number(),
        first_name: zod_1.z.string(),
        last_name: zod_1.z.string().optional(),
        username: zod_1.z.string().optional(),
        language_code: zod_1.z.string().optional(),
    }),
    auth_date: zod_1.z.number(),
    hash: zod_1.z.string(),
});
// Bot command schemas
exports.startTrialSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
exports.cancelSubscriptionSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
// Event log types
exports.eventLogSchema = zod_1.z.object({
    type: zod_1.z.enum([
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
    payload: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=schemas.js.map