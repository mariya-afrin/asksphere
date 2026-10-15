// server/api/questions/[id]/answers-with-comments.get.ts
// Same as /answers but each answer includes its comments.

import mongoose from 'mongoose'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import { Vote } from '../../../models/Vote'
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

    const question = await Question.findById(id).select('acceptedAnswerId').lean()
    if (!question) return fail(404, 'NOT_FOUND', 'Question not found.')

    const docs = await Answer.find({ questionId: id, deletedAt: null })
      .populate<{ authorId: { _id: unknown; username: string; avatarUrl?: string; reputation?: number } | null }>({
        path: 'authorId',
        select: 'username avatarUrl reputation'
      })
      .lean()

    const acceptedId = question.acceptedAnswerId ? String(question.acceptedAnswerId) : null
    const answerIds = docs.map((a) => a._id)

    // Fetch all comments for these answers in one query.
    const comments = await Comment.find({
      targetType: 'answer',
      targetId: { $in: answerIds },
      deletedAt: null
    })
      .sort({ createdAt: 1 })
      .populate<{ authorId: { _id: unknown; username: string } | null }>({
        path: 'authorId',
        select: 'username'
      })
      .lean()

    const commentsByAnswer: Record<string, { id: string; body: string; createdAt: string; author: { id: string | null; username: string } }[]> = {}
    for (const c of comments) {
      const key = String(c.targetId)
      if (!commentsByAnswer[key]) commentsByAnswer[key] = []
      commentsByAnswer[key].push({
        id: String(c._id),
        body: c.body,
        createdAt: (c as { createdAt: Date }).createdAt.toISOString(),
        author: c.authorId
          ? { id: String(c.authorId._id), username: c.authorId.username }
          : { id: null, username: 'deleted-user' }
      })
    }

    // Current user's votes
    const myVotes: Record<string, number> = {}
    const user = event.context.user
    if (user) {
      const votes = await Vote.find({ userId: user._id, answerId: { $in: answerIds } }).lean()
      for (const v of votes) myVotes[String(v.answerId)] = v.value
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
        comments: commentsByAnswer[String(a._id)] ?? [],
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