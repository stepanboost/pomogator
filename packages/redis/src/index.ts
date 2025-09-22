import Redis from 'ioredis'

// Create Redis client
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
})

redis.on('connect', () => {
  console.log('🔗 Connected to Redis')
})

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err)
})

// Rate limiting utilities
export class RateLimiter {
  private redis: Redis
  private prefix: string

  constructor(redis: Redis, prefix: string = 'rate_limit') {
    this.redis = redis
    this.prefix = prefix
  }

  async isAllowed(key: string, limit: number, windowMs: number): Promise<boolean> {
    const redisKey = `${this.prefix}:${key}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline()
    
    // Remove expired entries
    pipeline.zremrangebyscore(redisKey, 0, windowStart)
    
    // Count current entries
    pipeline.zcard(redisKey)
    
    // Add current request
    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`)
    
    // Set expiration
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    
    if (!results) return false
    
    const count = results[1][1] as number
    return count < limit
  }

  async getRemaining(key: string, limit: number, windowMs: number): Promise<number> {
    const redisKey = `${this.prefix}:${key}`
    const now = Date.now()
    const windowStart = now - windowMs

    await this.redis.zremrangebyscore(redisKey, 0, windowStart)
    const count = await this.redis.zcard(redisKey)
    
    return Math.max(0, limit - count)
  }
}

// Cache utilities
export class CacheService {
  private redis: Redis
  private prefix: string

  constructor(redis: Redis, prefix: string = 'cache') {
    this.redis = redis
    this.prefix = prefix
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(`${this.prefix}:${key}`)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.redis.setex(`${this.prefix}:${key}`, ttlSeconds, serialized)
      } else {
        await this.redis.set(`${this.prefix}:${key}`, serialized)
      }
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(`${this.prefix}:${key}`)
      return true
    } catch (error) {
      console.error('Cache del error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(`${this.prefix}:${key}`)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }
}

// Queue utilities
export class QueueService {
  private redis: Redis
  private prefix: string

  constructor(redis: Redis, prefix: string = 'queue') {
    this.redis = redis
    this.prefix = prefix
  }

  async push(queueName: string, data: any): Promise<boolean> {
    try {
      await this.redis.lpush(`${this.prefix}:${queueName}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Queue push error:', error)
      return false
    }
  }

  async pop(queueName: string): Promise<any | null> {
    try {
      const result = await this.redis.rpop(`${this.prefix}:${queueName}`)
      return result ? JSON.parse(result) : null
    } catch (error) {
      console.error('Queue pop error:', error)
      return null
    }
  }

  async length(queueName: string): Promise<number> {
    try {
      return await this.redis.llen(`${this.prefix}:${queueName}`)
    } catch (error) {
      console.error('Queue length error:', error)
      return 0
    }
  }

  async clear(queueName: string): Promise<boolean> {
    try {
      await this.redis.del(`${this.prefix}:${queueName}`)
      return true
    } catch (error) {
      console.error('Queue clear error:', error)
      return false
    }
  }
}

// Create instances
export const rateLimiter = new RateLimiter(redis)
export const cache = new CacheService(redis)
export const queue = new QueueService(redis)

export default redis
