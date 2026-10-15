// server/api/questions/[id]/accept-answer.post.ts
// POST /api/questions/:id/accept-answer
// Body: { answerId: string }
// Only the question author (or admin) can accept an answer.
import { createNotification } from '../../../utils/notifications'
import mongoose from 'mongoose'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import { User } from '../../../models/User'
import { connectDB } from '../../../utils/db'
import { requireUser } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = requireUser(event)

    const questionId = getRouterParam(event, 'id')
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const body = await readBody<{ answerId?: string }>(event)
    const answerId = body?.answerId
    if (!answerId || !mongoose.Types.ObjectId.isValid(answerId)) {
      return fail(400, 'INVALID_ID', 'Invalid answer ID.')
    }

    const question = await Question.findById(questionId).lean()
    if (!question) return fail(404, 'NOT_FOUND', 'Question not found.')

    if (String(question.authorId) !== String(user._id) && user.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'Only the question author can accept an answer.')
    }

    // The answer must belong to this question. Prevents accepting an
    // answer from a different question.
    const answer = await Answer.findOne({ _id: answerId, questionId }).lean()
    if (!answer || answer.deletedAt) {
      return fail(404, 'NOT_FOUND', 'Answer not found on this question.')
    }

    // Was there a previously accepted answer? Then we may need to
    // adjust the previous author's acceptedAnswerCount.
    const previousId = question.acceptedAnswerId ? String(question.acceptedAnswerId) : null

    if (previousId === answerId) {
      // Same answer — no-op.
      return ok({ acceptedAnswerId: answerId })
    }

    // Update the question.
    await Question.updateOne(
      { _id: questionId },
      { $set: { acceptedAnswerId: answerId } }
    )
// Notify the new accepted answer's author.
await createNotification({
  recipientId: newAuthorId,
  actorId: String(user._id),
  type: 'accept',
  questionId,
  answerId,
  message: `${user.username} accepted your answer to "${question.title}"`
})
    // Reputation: +15 to new accepted author, -15 to previous accepted author.
    const newAuthorId = String(answer.authorId)
    await User.updateOne({ _id: newAuthorId }, { $inc: { reputation: 15, acceptedAnswerCount: 1 } })

    if (previousId) {
      const prev = await Answer.findById(previousId).select('authorId').lean()
      if (prev) {
        await User.updateOne(
          { _id: prev.authorId },
          { $inc: { reputation: -15, acceptedAnswerCount: -1 } }
        )
      }
    }

    return ok({ acceptedAnswerId: answerId })
  } catch (err) {
    handleApiError(err)
  }
})