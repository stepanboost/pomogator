import express from 'express'
import { prisma } from '@pomogator/prisma'
import { createPaymentSchema } from '@pomogator/shared'
import { YooKassaService } from '../services/yookassa'
import { EventLogService } from '../services/eventLog'

const router = express.Router()
const yooKassaService = new YooKassaService()
const eventLogService = new EventLogService()

// Create payment
router.post('/create', async (req, res) => {
  try {
    const validatedData = createPaymentSchema.parse(req.body)
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Create payment in YooKassa
    const paymentData = await yooKassaService.createPayment({
      amount: {
        value: validatedData.amount.toFixed(2),
        currency: validatedData.currency
      },
      description: validatedData.description || 'Помогатор: месячная подписка',
      metadata: {
        userId: validatedData.userId,
        type: 'subscription'
      }
    })

    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        userId: validatedData.userId,
        invoiceId: paymentData.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'PENDING',
        meta: paymentData
      }
    })

    // Log event
    await eventLogService.logEvent(validatedData.userId, 'payment_created', {
      paymentId: payment.id,
      amount: validatedData.amount,
      currency: validatedData.currency
    })

    res.json({
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      paymentUrl: paymentData.confirmation?.confirmation_url,
      amount: validatedData.amount,
      currency: validatedData.currency,
      status: payment.status
    })
  } catch (error) {
    console.error('Create payment error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get payment status
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    res.json({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    })
  } catch (error) {
    console.error('Get payment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user payments
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json(payments.map(payment => ({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    })))
  } catch (error) {
    console.error('Get user payments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
