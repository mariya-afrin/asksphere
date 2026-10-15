// server/api/notifications/[id]/read.patch.ts

import mongoose from 'mongoose'
import { Notification } from '../../../models/Notification'
import { connectDB } from '../../../utils/db'
import { requireUser } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid notification ID.')
    }

    // Only the recipient can mark their own notification as read.
    const result = await Notification.updateOne(
      { _id: id, recipientId: user._id },
      { $set: { readAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return fail(404, 'NOT_FOUND', 'Notification not found.')
    }

    return ok({ read: true })
  } catch (err) {
    handleApiError(err)
  }
})