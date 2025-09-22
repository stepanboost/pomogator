import { createHash, createHmac } from 'crypto'
import { telegramInitDataSchema, type TelegramInitData } from './schemas'

/**
 * Validates Telegram Mini App init data signature
 */
export function validateTelegramInitData(initData: string, botToken: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    
    if (!hash) return null

    // Remove hash from params for validation
    urlParams.delete('hash')
    
    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Create secret key from bot token
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
    
    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
    
    if (calculatedHash !== hash) return null

    // Parse and validate data
    const userData: Record<string, any> = {}
    for (const [key, value] of urlParams.entries()) {
      if (key === 'user') {
        userData[key] = JSON.parse(value)
      } else {
        userData[key] = value
      }
    }

    return telegramInitDataSchema.parse(userData)
  } catch (error) {
    console.error('Error validating Telegram init data:', error)
    return null
  }
}

/**
 * Generates JWT token for user authentication
 */
export function generateJWT(userId: string, tgId: string, secret: string): string {
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
  
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verifies JWT token
 */
export function verifyJWT(token: string, secret: string): { userId: string; tgId: string } | null {
  try {
    const [header, payload, signature] = token.split('.')
    
    if (!header || !payload || !signature) return null

    const calculatedSignature = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url')

    if (calculatedSignature !== signature) return null

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString())
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) return null

    return {
      userId: decodedPayload.userId,
      tgId: decodedPayload.tgId
    }
  } catch (error) {
    console.error('Error verifying JWT:', error)
    return null
  }
}

/**
 * Formats amount for YooKassa (multiply by 100 for kopecks)
 */
export function formatAmountForYooKassa(amount: number): string {
  return (amount * 100).toFixed(0)
}

/**
 * Parses amount from YooKassa (divide by 100 from kopecks)
 */
export function parseAmountFromYooKassa(amount: string): number {
  return parseInt(amount) / 100
}
