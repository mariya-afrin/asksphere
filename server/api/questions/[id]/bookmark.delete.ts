// server/api/questions/[id]/bookmark.delete.ts
// DELETE /api/questions/:id/bookmark
// Removes the bookmark if it exists. Idempotent.

import mongoose from 'mongoose'
import { Bookmark } from '../../../models/Bookmark'
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

    await Bookmark.deleteOne({ userId: user._id, questionId: id })

    return ok({ bookmarked: false })
  } catch (err) {
    handleApiError(err)
  }
})