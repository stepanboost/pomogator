import express from 'express'
import { EventLogService } from '../services/eventLog'

const router = express.Router()
const eventLogService = new EventLogService()

// Log event
router.post('/log', async (req, res) => {
  try {
    const { userId, type, payload } = req.body
    await eventLogService.logEvent(userId, type, payload)
    res.json({ success: true })
  } catch (error) {
    console.error('Log event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user events
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50 } = req.query
    const events = await eventLogService.getUserEvents(userId, Number(limit))
    res.json(events)
  } catch (error) {
    console.error('Get user events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get events by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params
    const { limit = 100 } = req.query
    const events = await eventLogService.getEventsByType(type as any, Number(limit))
    res.json(events)
  } catch (error) {
    console.error('Get events by type error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
