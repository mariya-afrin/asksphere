// server/api/notifications/index.get.ts
// GET /api/notifications
// Retrieves notifications for the currently logged-in user.

import { Notification } from '../../models/Notification'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const [docs, unreadCount] = await Promise.all([
      Notification.find({ recipientId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate<{ actorId: { _id: unknown; username: string; avatarUrl?: string } | null }>({
          path: 'actorId',
          select: 'username avatarUrl'
        })
        .lean(),
      Notification.countDocuments({ recipientId: user._id, readAt: null })
    ])

    const items = docs.map((n) => ({
      id: String(n._id),
      type: n.type,
      message: n.message,
      questionId: n.questionId ? String(n.questionId) : null,
      answerId: n.answerId ? String(n.answerId) : null,
      read: Boolean(n.readAt),
      createdAt: (n as { createdAt: Date }).createdAt.toISOString(),
      actor: n.actorId
        ? {
            id: String(n.actorId._id),
            username: n.actorId.username,
            avatarUrl: n.actorId.avatarUrl ?? ''
          }
        : { id: null, username: 'someone', avatarUrl: '' }
    }))

    return ok({ items, unreadCount })
  } catch (err) {
    handleApiError(err)
  }
})
