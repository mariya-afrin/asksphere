// server/api/notifications/read-all.post.ts

import { Notification } from '../../models/Notification'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    await Notification.updateMany(
      { recipientId: user._id, readAt: null },
      { $set: { readAt: new Date() } }
    )

    return ok({ ok: true })
  } catch (err) {
    handleApiError(err)
  }
})