// server/api/comments/[id].patch.ts
// PATCH /api/comments/:id
// Only the author can edit.

import mongoose from 'mongoose'
import { Comment } from '../../models/Comment'
import { connectDB } from '../../utils/db'
import { commentUpdateSchema } from '../../utils/validation'
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
      return fail(403, 'FORBIDDEN', 'You can only edit your own comments.')
    }

    const raw = await readBody(event)
    const parsed = commentUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    const updated = await Comment.findByIdAndUpdate(
      id,
      { $set: { body: parsed.data.body } },
      { new: true }
    ).lean()

    return ok({
      id: String(updated!._id),
      body: updated!.body,
      updatedAt: (updated as { updatedAt: Date }).updatedAt.toISOString()
    })
  } catch (err) {
    handleApiError(err)
  }
})