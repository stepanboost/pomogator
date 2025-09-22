import { type TelegramInitData } from './schemas';
/**
 * Validates Telegram Mini App init data signature
 */
export declare function validateTelegramInitData(initData: string, botToken: string): TelegramInitData | null;
/**
 * Generates JWT token for user authentication
 */
export declare function generateJWT(userId: string, tgId: string, secret: string): string;
/**
 * Verifies JWT token
 */
export declare function verifyJWT(token: string, secret: string): {
    userId: string;
    tgId: string;
} | null;
/**
 * Formats amount for YooKassa (multiply by 100 for kopecks)
 */
export declare function formatAmountForYooKassa(amount: number): string;
/**
 * Parses amount from YooKassa (divide by 100 from kopecks)
 */
export declare function parseAmountFromYooKassa(amount: string): number;
//# sourceMappingURL=utils.d.ts.map