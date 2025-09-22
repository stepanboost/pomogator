import express from 'express'
import { prisma } from '@pomogator/prisma'
import { generateJWT, verifyJWT, validateTelegramInitData } from '@pomogator/shared'
import { envSchema } from '@pomogator/shared'

const router = express.Router()
const env = envSchema.parse(process.env)

// Issue JWT token for authenticated user
router.post('/issue', async (req, res) => {
  try {
    const { initData } = req.body

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' })
    }

    // Validate Telegram init data
    const validatedData = validateTelegramInitData(initData, env.BOT_TOKEN)
    if (!validatedData) {
      return res.status(401).json({ error: 'Invalid init data' })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { tgId: validatedData.user.id.toString() }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          tgId: validatedData.user.id.toString(),
          username: validatedData.user.username,
          firstName: validatedData.user.first_name,
        }
      })
    }

    // Check user access
    const access = await prisma.access.findUnique({
      where: { userId: user.id }
    })

    if (!access || (access.status !== 'TRIAL' && access.status !== 'ACTIVE')) {
      return res.status(403).json({ 
        error: 'Access denied',
        hasAccess: false,
        accessStatus: access?.status || 'none'
      })
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.tgId, env.JWT_SECRET)

    res.json({
      token,
      user: {
        id: user.id,
        tgId: user.tgId,
        username: user.username,
        firstName: user.firstName
      },
      access: {
        status: access.status,
        trialEndsAt: access.trialEndsAt,
        subscriptionEndsAt: access.subscriptionEndsAt
      }
    })
  } catch (error) {
    console.error('Auth issue error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify JWT token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const payload = verifyJWT(token, env.JWT_SECRET)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user and access info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { access: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        tgId: user.tgId,
        username: user.username,
        firstName: user.firstName
      },
      access: user.access ? {
        status: user.access.status,
        trialEndsAt: user.access.trialEndsAt,
        subscriptionEndsAt: user.access.subscriptionEndsAt
      } : null
    })
  } catch (error) {
    console.error('Auth verify error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Refresh JWT token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const payload = verifyJWT(token, env.JWT_SECRET)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Generate new token
    const newToken = generateJWT(payload.userId, payload.tgId, env.JWT_SECRET)

    res.json({ token: newToken })
  } catch (error) {
    console.error('Auth refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
