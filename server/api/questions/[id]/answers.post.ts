// server/api/questions/[id]/answers.post.ts
// Adds a notification to the question author.

import mongoose from 'mongoose'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import { User } from '../../../models/User'
import { connectDB } from '../../../utils/db'
import { answerCreateSchema } from '../../../utils/validation'
import { requireUser } from '../../../utils/auth'
import { createNotification } from '../../../utils/notifications'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const question = await Question.findById(id).select('authorId status title').lean()
    if (!question) return fail(404, 'NOT_FOUND', 'Question not found.')
    if (question.status === 'closed') {
      return fail(403, 'QUESTION_CLOSED', 'This question is closed for new answers.')
    }
    if (question.status === 'removed') return fail(404, 'NOT_FOUND', 'Question not found.')

    const raw = await readBody(event)
    const parsed = answerCreateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    const answer = await Answer.create({
      questionId: id,
      authorId: user._id,
      body: parsed.data.body
    })

    await Promise.all([
      Question.updateOne({ _id: id }, { $inc: { answerCount: 1 } }),
      User.updateOne({ _id: user._id }, { $inc: { answerCount: 1 } })
    ])

    await createNotification({
      recipientId: String(question.authorId),
      actorId: String(user._id),
      type: 'answer',
      questionId: id,
      answerId: String(answer._id),
      message: `${user.username} answered your question: "${question.title}"`
    })

    return ok({
      id: String(answer._id),
      body: answer.body,
      createdAt: answer.createdAt.toISOString()
    })
  } catch (err) {
    handleApiError(err)
  }
})