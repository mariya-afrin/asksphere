// server/api/questions/[id]/answers.get.ts
// Includes the current user's vote (if logged in) so the UI can show
// which button is active.

import mongoose from 'mongoose'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import { Vote } from '../../../models/Vote'
import { connectDB } from '../../../utils/db'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const question = await Question.findById(id).select('acceptedAnswerId').lean()
    if (!question) return fail(404, 'NOT_FOUND', 'Question not found.')

    const docs = await Answer.find({ questionId: id, deletedAt: null })
      .populate<{ authorId: { _id: unknown; username: string; avatarUrl?: string; reputation?: number } | null }>({
        path: 'authorId',
        select: 'username avatarUrl reputation'
      })
      .lean()

    const acceptedId = question.acceptedAnswerId ? String(question.acceptedAnswerId) : null

    // If the user is logged in, look up all their votes on these answers.
    const myVotes: Record<string, number> = {}
    const user = event.context.user
    if (user) {
      const answerIds = docs.map((a) => a._id)
      const votes = await Vote.find({
        userId: user._id,
        answerId: { $in: answerIds }
      }).lean()
      for (const v of votes) {
        myVotes[String(v.answerId)] = v.value
      }
    }

    const items = docs
      .sort((a, b) => {
        if (String(a._id) === acceptedId) return -1
        if (String(b._id) === acceptedId) return 1
        if (b.voteScore !== a.voteScore) return b.voteScore - a.voteScore
        return (a as { createdAt: Date }).createdAt.getTime() -
               (b as { createdAt: Date }).createdAt.getTime()
      })
      .map((a) => ({
        id: String(a._id),
        body: a.body,
        voteScore: a.voteScore,
        myVote: myVotes[String(a._id)] ?? 0,
        isAccepted: String(a._id) === acceptedId,
        createdAt: (a as { createdAt: Date }).createdAt.toISOString(),
        updatedAt: (a as { updatedAt: Date }).updatedAt.toISOString(),
        author: a.authorId
          ? {
              id: String(a.authorId._id),
              username: a.authorId.username,
              avatarUrl: a.authorId.avatarUrl ?? '',
              reputation: a.authorId.reputation ?? 0
            }
          : { id: null, username: 'deleted-user', avatarUrl: '', reputation: 0 }
      }))

    return ok({ items })
  } catch (err) {
    handleApiError(err)
  }
})