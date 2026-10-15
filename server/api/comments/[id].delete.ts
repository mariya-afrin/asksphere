// server/api/comments/[id].delete.ts
// DELETE /api/comments/:id
// Soft delete.

import mongoose from 'mongoose'
import { Comment } from '../../models/Comment'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid comment ID.')
    }

    const existing = await Comment.findById(id).lean()
    if (!existing || existing.deletedAt) return fail(404, 'NOT_FOUND', 'Comment not found.')

    if (String(existing.authorId) !== String(user._id) && user.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'You can only delete your own comments.')
    }

    await Comment.updateOne({ _id: id }, { $set: { deletedAt: new Date() } })

    return ok({ removed: true })
  } catch (err) {
    handleApiError(err)
  }
})