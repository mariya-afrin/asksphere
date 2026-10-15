// server/api/questions/[id]/comments.get.ts
// GET /api/questions/:id/comments
// Public. Returns non-deleted comments on the question itself
// (not on the answers).

import mongoose from 'mongoose'
import { Comment } from '../../../models/Comment'
import { connectDB } from '../../../utils/db'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const items = await Comment.find({
      targetType: 'question',
      targetId: id,
      deletedAt: null
    })
      .sort({ createdAt: 1 })
      .populate<{ authorId: { _id: unknown; username: string } | null }>({
        path: 'authorId',
        select: 'username'
      })
      .lean()

    return ok({
      items: items.map((c) => ({
        id: String(c._id),
        body: c.body,
        createdAt: (c as { createdAt: Date }).createdAt.toISOString(),
        author: c.authorId
          ? { id: String(c.authorId._id), username: c.authorId.username }
          : { id: null, username: 'deleted-user' }
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})