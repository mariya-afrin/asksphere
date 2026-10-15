// server/api/questions/[id]/bookmark.put.ts
// PUT /api/questions/:id/bookmark
// Idempotent: calling it twice does not create a duplicate.

import mongoose from 'mongoose'
import { Bookmark } from '../../../models/Bookmark'
import { Question } from '../../../models/Question'
import { connectDB } from '../../../utils/db'
import { requireUser } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const q = await Question.findById(id).select('status').lean()
    if (!q || q.status === 'removed') return fail(404, 'NOT_FOUND', 'Question not found.')

    await Bookmark.updateOne(
      { userId: user._id, questionId: id },
      { $setOnInsert: { userId: user._id, questionId: id } },
      { upsert: true }
    )

    return ok({ bookmarked: true })
  } catch (err) {
    handleApiError(err)
  }
})