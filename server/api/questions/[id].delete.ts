// server/api/questions/[id].delete.ts
// DELETE /api/questions/:id
// Soft-delete: mark as removed. We keep the document so
// related answers and comments do not become orphans.

import mongoose from 'mongoose'
import { Question } from '../../models/Question'
import { Answer } from '../../models/Answer'
import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const question = await Question.findById(id).lean()
    if (!question) return fail(404, 'NOT_FOUND', 'Question not found.')

    if (String(question.authorId) !== String(user._id) && user.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'You can only delete your own questions.')
    }

    if (question.status === 'removed') {
      return ok({ alreadyRemoved: true })
    }

    // Soft delete: mark as removed.
    await Question.updateOne({ _id: id }, { $set: { status: 'removed' } })

    // Soft delete all answers.
    await Answer.updateMany(
      { questionId: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    )

    // Decrement the author's question count if the author is still around.
    await User.updateOne({ _id: question.authorId }, { $inc: { questionCount: -1 } })

    return ok({ removed: true })
  } catch (err) {
    handleApiError(err)
  }
})