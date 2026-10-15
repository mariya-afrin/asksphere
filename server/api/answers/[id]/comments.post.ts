import mongoose from 'mongoose'
import { Comment } from '../../../models/Comment'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import { connectDB } from '../../../utils/db'
import { commentCreateSchema } from '../../../utils/validation'
import { requireUser } from '../../../utils/auth'
import { createNotification } from '../../../utils/notifications'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid answer ID.')
    }

    const answer = await Answer.findById(id).select('authorId questionId').lean()
    if (!answer || answer.deletedAt) return fail(404, 'NOT_FOUND', 'Answer not found.')

    const raw = await readBody(event)
    const parsed = commentCreateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    const comment = await Comment.create({
      authorId: user._id,
      targetType: 'answer',
      targetId: id,
      body: parsed.data.body
    })

    const q = await Question.findById(answer.questionId).select('title').lean()

    await createNotification({
      recipientId: String(answer.authorId),
      actorId: String(user._id),
      type: 'comment',
      questionId: answer.questionId,
      answerId: id,
      message: `${user.username} commented on your answer to "${q?.title ?? 'a question'}"`
    })

    return ok({
      id: String(comment._id),
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: { id: String(user._id), username: user.username }
    })
  } catch (err) {
    handleApiError(err)
  }
})