// server/api/answers/[id].delete.ts
// DELETE /api/answers/:id
// Soft delete. Also decrements counters.

import mongoose from 'mongoose'
import { Answer } from '../../models/Answer'
import { Question } from '../../models/Question'
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
      return fail(400, 'INVALID_ID', 'Invalid answer ID.')
    }

    const answer = await Answer.findById(id).lean()
    if (!answer || answer.deletedAt) return fail(404, 'NOT_FOUND', 'Answer not found.')

    if (String(answer.authorId) !== String(user._id) && user.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'You can only delete your own answers.')
    }

    await Answer.updateOne({ _id: id }, { $set: { deletedAt: new Date() } })

    // Decrement counters, but never below zero.
    await Promise.all([
      Question.updateOne(
        { _id: answer.questionId, answerCount: { $gt: 0 } },
        { $inc: { answerCount: -1 } }
      ),
      User.updateOne(
        { _id: answer.authorId, answerCount: { $gt: 0 } },
        { $inc: { answerCount: -1 } }
      )
    ])

    // If this answer was the accepted one, clear the field on the question.
    const question = await Question.findById(answer.questionId).select('acceptedAnswerId').lean()
    if (question && String(question.acceptedAnswerId) === id) {
      await Question.updateOne({ _id: answer.questionId }, { $set: { acceptedAnswerId: null } })
    }

    return ok({ removed: true })
  } catch (err) {
    handleApiError(err)
  }
})