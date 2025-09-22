import express from 'express'
import { prisma } from '@pomogator/prisma'
import { paymentWebhookSchema } from '@pomogator/shared'
import { YooKassaService } from '../services/yookassa'
import { EventLogService } from '../services/eventLog'
import { AccessService } from '../services/access'

const router = express.Router()
const yooKassaService = new YooKassaService()
const eventLogService = new EventLogService()
const accessService = new AccessService()

// YooKassa webhook
router.post('/yookassa', async (req, res) => {
  try {
    // Verify webhook signature (implement based on YooKassa docs)
    const isValid = await yooKassaService.verifyWebhook(req)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    const webhookData = paymentWebhookSchema.parse(req.body)
    
    // Find payment by invoice ID
    const payment = await prisma.payment.findUnique({
      where: { invoiceId: webhookData.object.id },
      include: { user: true }
    })

    if (!payment) {
      console.error('Payment not found for invoice ID:', webhookData.object.id)
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Update payment status
    const newStatus = webhookData.object.status === 'succeeded' ? 'SUCCEEDED' : 
                     webhookData.object.status === 'canceled' ? 'CANCELED' : 
                     'PENDING'

    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: newStatus,
        meta: webhookData
      }
    })

    // If payment succeeded, activate user access
    if (webhookData.object.status === 'succeeded') {
      await accessService.activateSubscription(payment.userId)
      
      // Log event
      await eventLogService.logEvent(payment.userId, 'payment_succeeded', {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency
      })
    } else if (webhookData.object.status === 'canceled') {
      // Log event
      await eventLogService.logEvent(payment.userId, 'payment_failed', {
        paymentId: payment.id,
        reason: 'canceled'
      })
    }

    res.json({ status: 'ok' })
  } catch (error) {
    console.error('YooKassa webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Telegram webhook (if needed for bot)
router.post('/telegram', async (req, res) => {
  try {
    // This would be used if we need to receive updates from Telegram
    // For now, we're using polling in the bot
    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
