"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.cache = exports.rateLimiter = exports.QueueService = exports.CacheService = exports.RateLimiter = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Create Redis client
exports.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});
exports.redis.on('connect', () => {
    console.log('🔗 Connected to Redis');
});
exports.redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});
// Rate limiting utilities
class RateLimiter {
    constructor(redis, prefix = 'rate_limit') {
        this.redis = redis;
        this.prefix = prefix;
    }
    async isAllowed(key, limit, windowMs) {
        const redisKey = `${this.prefix}:${key}`;
        const now = Date.now();
        const windowStart = now - windowMs;
        // Use Redis pipeline for atomic operations
        const pipeline = this.redis.pipeline();
        // Remove expired entries
        pipeline.zremrangebyscore(redisKey, 0, windowStart);
        // Count current entries
        pipeline.zcard(redisKey);
        // Add current request
        pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
        // Set expiration
        pipeline.expire(redisKey, Math.ceil(windowMs / 1000));
        const results = await pipeline.exec();
        if (!results)
            return false;
        const count = results[1][1];
        return count < limit;
    }
    async getRemaining(key, limit, windowMs) {
        const redisKey = `${this.prefix}:${key}`;
        const now = Date.now();
        const windowStart = now - windowMs;
        await this.redis.zremrangebyscore(redisKey, 0, windowStart);
        const count = await this.redis.zcard(redisKey);
        return Math.max(0, limit - count);
    }
}
exports.RateLimiter = RateLimiter;
// Cache utilities
class CacheService {
    constructor(redis, prefix = 'cache') {
        this.redis = redis;
        this.prefix = prefix;
    }
    async get(key) {
        try {
            const value = await this.redis.get(`${this.prefix}:${key}`);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.redis.setex(`${this.prefix}:${key}`, ttlSeconds, serialized);
            }
            else {
                await this.redis.set(`${this.prefix}:${key}`, serialized);
            }
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    async del(key) {
        try {
            await this.redis.del(`${this.prefix}:${key}`);
            return true;
        }
        catch (error) {
            console.error('Cache del error:', error);
            return false;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(`${this.prefix}:${key}`);
            return result === 1;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
}
exports.CacheService = CacheService;
// Queue utilities
class QueueService {
    constructor(redis, prefix = 'queue') {
        this.redis = redis;
        this.prefix = prefix;
    }
    async push(queueName, data) {
        try {
            await this.redis.lpush(`${this.prefix}:${queueName}`, JSON.stringify(data));
            return true;
        }
        catch (error) {
            console.error('Queue push error:', error);
            return false;
        }
    }
    async pop(queueName) {
        try {
            const result = await this.redis.rpop(`${this.prefix}:${queueName}`);
            return result ? JSON.parse(result) : null;
        }
        catch (error) {
            console.error('Queue pop error:', error);
            return null;
        }
    }
    async length(queueName) {
        try {
            return await this.redis.llen(`${this.prefix}:${queueName}`);
        }
        catch (error) {
            console.error('Queue length error:', error);
            return 0;
        }
    }
    async clear(queueName) {
        try {
            await this.redis.del(`${this.prefix}:${queueName}`);
            return true;
        }
        catch (error) {
            console.error('Queue clear error:', error);
            return false;
        }
    }
}
exports.QueueService = QueueService;
// Create instances
exports.rateLimiter = new RateLimiter(exports.redis);
exports.cache = new CacheService(exports.redis);
exports.queue = new QueueService(exports.redis);
exports.default = exports.redis;
//# sourceMappingURL=index.js.map