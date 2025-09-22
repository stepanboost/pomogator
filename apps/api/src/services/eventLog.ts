import { prisma } from '@pomogator/prisma'
import { EventLogType } from '@pomogator/shared'

export class EventLogService {
  async logEvent(userId: string, type: EventLogType, payload?: Record<string, any>): Promise<void> {
    try {
      await prisma.eventLog.create({
        data: {
          userId,
          type,
          payload: payload || {}
        }
      })
    } catch (error) {
      console.error('Log event error:', error)
      // Don't throw error to avoid breaking main flow
    }
  }

  async getUserEvents(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const events = await prisma.eventLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return events
    } catch (error) {
      console.error('Get user events error:', error)
      return []
    }
  }

  async getEventsByType(type: EventLogType, limit: number = 100): Promise<any[]> {
    try {
      const events = await prisma.eventLog.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: true }
      })

      return events
    } catch (error) {
      console.error('Get events by type error:', error)
      return []
    }
  }
}
