import express from 'express'
import { AccessService } from '../services/access'
import { EventLogService } from '../services/eventLog'

const router = express.Router()
const accessService = new AccessService()
const eventLogService = new EventLogService()

// Get user access status
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const access = await accessService.checkAccess(userId)
    res.json(access)
  } catch (error) {
    console.error('Get access error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Start trial
router.post('/start-trial', async (req, res) => {
  try {
    const { userId } = req.body
    const result = await accessService.startTrial(userId)
    
    if (result.success) {
      await eventLogService.logEvent(userId, 'trial_started', {
        trialEndsAt: result.trialEndsAt
      })
    }
    
    res.json(result)
  } catch (error) {
    console.error('Start trial error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body
    const result = await accessService.cancelSubscription(userId)
    
    if (result.success) {
      await eventLogService.logEvent(userId, 'subscription_canceled', {
        deactivationDate: result.deactivationDate
      })
    }
    
    res.json(result)
  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
