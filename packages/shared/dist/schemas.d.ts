import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    BOT_TOKEN: z.ZodString;
    WEBAPP_URL: z.ZodString;
    API_BASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    YK_SHOP_ID: z.ZodString;
    YK_SECRET_KEY: z.ZodString;
    YK_RETURN_URL: z.ZodString;
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    APP_BASE_URL: z.ZodString;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
}, "strip", z.ZodTypeAny, {
    BOT_TOKEN: string;
    WEBAPP_URL: string;
    API_BASE_URL: string;
    JWT_SECRET: string;
    YK_SHOP_ID: string;
    YK_SECRET_KEY: string;
    YK_RETURN_URL: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    APP_BASE_URL: string;
    NODE_ENV: "development" | "production" | "test";
}, {
    BOT_TOKEN: string;
    WEBAPP_URL: string;
    API_BASE_URL: string;
    JWT_SECRET: string;
    YK_SHOP_ID: string;
    YK_SECRET_KEY: string;
    YK_RETURN_URL: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    APP_BASE_URL: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const jwtPayloadSchema: z.ZodObject<{
    userId: z.ZodString;
    tgId: z.ZodString;
    iat: z.ZodNumber;
    exp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: string;
    tgId: string;
    iat: number;
    exp: number;
}, {
    userId: string;
    tgId: string;
    iat: number;
    exp: number;
}>;
export type JWTPayload = z.infer<typeof jwtPayloadSchema>;
export declare const createPaymentSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    amount: number;
    currency: string;
    description?: string | undefined;
}, {
    userId: string;
    amount: number;
    currency?: string | undefined;
    description?: string | undefined;
}>;
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export declare const paymentWebhookSchema: z.ZodObject<{
    event: z.ZodString;
    type: z.ZodString;
    object: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<["pending", "waiting_for_capture", "succeeded", "canceled"]>;
        amount: z.ZodObject<{
            value: z.ZodString;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            currency: string;
        }, {
            value: string;
            currency: string;
        }>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
        amount: {
            value: string;
            currency: string;
        };
        id: string;
        metadata?: Record<string, string> | undefined;
    }, {
        status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
        amount: {
            value: string;
            currency: string;
        };
        id: string;
        metadata?: Record<string, string> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    object: {
        status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
        amount: {
            value: string;
            currency: string;
        };
        id: string;
        metadata?: Record<string, string> | undefined;
    };
    type: string;
    event: string;
}, {
    object: {
        status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
        amount: {
            value: string;
            currency: string;
        };
        id: string;
        metadata?: Record<string, string> | undefined;
    };
    type: string;
    event: string;
}>;
export type PaymentWebhook = z.infer<typeof paymentWebhookSchema>;
export declare const telegramInitDataSchema: z.ZodObject<{
    query_id: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodNumber;
        first_name: z.ZodString;
        last_name: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        language_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        first_name: string;
        last_name?: string | undefined;
        username?: string | undefined;
        language_code?: string | undefined;
    }, {
        id: number;
        first_name: string;
        last_name?: string | undefined;
        username?: string | undefined;
        language_code?: string | undefined;
    }>;
    auth_date: z.ZodNumber;
    hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query_id: string;
    user: {
        id: number;
        first_name: string;
        last_name?: string | undefined;
        username?: string | undefined;
        language_code?: string | undefined;
    };
    auth_date: number;
    hash: string;
}, {
    query_id: string;
    user: {
        id: number;
        first_name: string;
        last_name?: string | undefined;
        username?: string | undefined;
        language_code?: string | undefined;
    };
    auth_date: number;
    hash: string;
}>;
export type TelegramInitData = z.infer<typeof telegramInitDataSchema>;
export declare const startTrialSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const cancelSubscriptionSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const eventLogSchema: z.ZodObject<{
    type: z.ZodEnum<["trial_started", "trial_reminder", "trial_expired", "payment_created", "payment_succeeded", "payment_failed", "subscription_canceled", "app_opened", "tutorial_started", "tutorial_completed"]>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "trial_started" | "trial_reminder" | "trial_expired" | "payment_created" | "payment_succeeded" | "payment_failed" | "subscription_canceled" | "app_opened" | "tutorial_started" | "tutorial_completed";
    payload?: Record<string, any> | undefined;
}, {
    type: "trial_started" | "trial_reminder" | "trial_expired" | "payment_created" | "payment_succeeded" | "payment_failed" | "subscription_canceled" | "app_opened" | "tutorial_started" | "tutorial_completed";
    payload?: Record<string, any> | undefined;
}>;
export type EventLogType = z.infer<typeof eventLogSchema>['type'];
//# sourceMappingURL=schemas.d.ts.map