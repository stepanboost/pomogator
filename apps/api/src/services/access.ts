import { prisma } from '@pomogator/prisma'

export class AccessService {
  async startTrial(userId: string): Promise<{ success: boolean; message: string; trialEndsAt?: Date }> {
    try {
      // Check if user already has access
      const existingAccess = await prisma.access.findUnique({
        where: { userId }
      })

      if (existingAccess) {
        if (existingAccess.status === 'TRIAL' || existingAccess.status === 'ACTIVE') {
          return {
            success: false,
            message: existingAccess.status === 'TRIAL' 
              ? `У вас уже есть пробный период до ${existingAccess.trialEndsAt?.toLocaleDateString('ru-RU')}`
              : 'У вас уже есть активная подписка'
          }
        }
      }

      // Calculate trial end date (3 days from now)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 3)

      // Create or update access
      await prisma.access.upsert({
        where: { userId },
        create: {
          userId,
          status: 'TRIAL',
          trialStartedAt: new Date(),
          trialEndsAt
        },
        update: {
          status: 'TRIAL',
          trialStartedAt: new Date(),
          trialEndsAt
        }
      })

      return {
        success: true,
        message: `Пробный период активирован до ${trialEndsAt.toLocaleDateString('ru-RU')}`,
        trialEndsAt
      }
    } catch (error) {
      console.error('Start trial error:', error)
      return {
        success: false,
        message: 'Ошибка при активации пробного периода'
      }
    }
  }

  async activateSubscription(userId: string): Promise<boolean> {
    try {
      // Calculate subscription end date (30 days from now)
      const subscriptionEndsAt = new Date()
      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30)

      await prisma.access.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          subscriptionEndsAt,
          trialEndsAt: null // Clear trial end date
        }
      })

      return true
    } catch (error) {
      console.error('Activate subscription error:', error)
      return false
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string; deactivationDate?: Date }> {
    try {
      const access = await prisma.access.findUnique({
        where: { userId }
      })

      if (!access) {
        return {
          success: false,
          message: 'Подписка не найдена'
        }
      }

      if (access.status === 'CANCELED') {
        return {
          success: false,
          message: 'Подписка уже отменена'
        }
      }

      // Mark as canceled but keep access until subscription ends
      await prisma.access.update({
        where: { userId },
        data: {
          status: 'CANCELED'
        }
      })

      return {
        success: true,
        message: `Подписка отменена. Доступ будет действовать до ${access.subscriptionEndsAt?.toLocaleDateString('ru-RU') || 'неизвестно'}`,
        deactivationDate: access.subscriptionEndsAt
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return {
        success: false,
        message: 'Ошибка при отмене подписки'
      }
    }
  }

  async checkAccess(userId: string): Promise<{ hasAccess: boolean; status: string; expiresAt?: Date }> {
    try {
      const access = await prisma.access.findUnique({
        where: { userId }
      })

      if (!access) {
        return { hasAccess: false, status: 'none' }
      }

      const now = new Date()
      let hasAccess = false
      let expiresAt: Date | undefined

      if (access.status === 'TRIAL' && access.trialEndsAt) {
        hasAccess = now < access.trialEndsAt
        expiresAt = access.trialEndsAt
      } else if (access.status === 'ACTIVE' && access.subscriptionEndsAt) {
        hasAccess = now < access.subscriptionEndsAt
        expiresAt = access.subscriptionEndsAt
      }

      // If access expired, update status
      if (!hasAccess && (access.status === 'TRIAL' || access.status === 'ACTIVE')) {
        await prisma.access.update({
          where: { userId },
          data: { status: 'EXPIRED' }
        })
      }

      return {
        hasAccess,
        status: access.status,
        expiresAt
      }
    } catch (error) {
      console.error('Check access error:', error)
      return { hasAccess: false, status: 'error' }
    }
  }

  async getExpiredTrials(): Promise<string[]> {
    try {
      const now = new Date()
      const expiredTrials = await prisma.access.findMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: {
            lt: now
          }
        },
        select: { userId: true }
      })

      // Update status to expired
      await prisma.access.updateMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: {
            lt: now
          }
        },
        data: { status: 'EXPIRED' }
      })

      return expiredTrials.map(access => access.userId)
    } catch (error) {
      console.error('Get expired trials error:', error)
      return []
    }
  }

  async getExpiringTrials(hoursBeforeExpiry: number = 6): Promise<string[]> {
    try {
      const now = new Date()
      const expiryThreshold = new Date(now.getTime() + hoursBeforeExpiry * 60 * 60 * 1000)

      const expiringTrials = await prisma.access.findMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: {
            gte: now,
            lte: expiryThreshold
          }
        },
        select: { userId: true }
      })

      return expiringTrials.map(access => access.userId)
    } catch (error) {
      console.error('Get expiring trials error:', error)
      return []
    }
  }
}
