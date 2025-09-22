import Redis from 'ioredis';
export declare const redis: Redis;
export declare class RateLimiter {
    private redis;
    private prefix;
    constructor(redis: Redis, prefix?: string);
    isAllowed(key: string, limit: number, windowMs: number): Promise<boolean>;
    getRemaining(key: string, limit: number, windowMs: number): Promise<number>;
}
export declare class CacheService {
    private redis;
    private prefix;
    constructor(redis: Redis, prefix?: string);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
}
export declare class QueueService {
    private redis;
    private prefix;
    constructor(redis: Redis, prefix?: string);
    push(queueName: string, data: any): Promise<boolean>;
    pop(queueName: string): Promise<any | null>;
    length(queueName: string): Promise<number>;
    clear(queueName: string): Promise<boolean>;
}
export declare const rateLimiter: RateLimiter;
export declare const cache: CacheService;
export declare const queue: QueueService;
export default redis;
//# sourceMappingURL=index.d.ts.map