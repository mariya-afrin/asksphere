// server/api/users/[username].get.ts
// Public profile. Never includes email or passwordHash.

import { User } from '../../models/User'
import { Question } from '../../models/Question'
import { Answer } from '../../models/Answer'
import { connectDB } from '../../utils/db'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const username = getRouterParam(event, 'username')
    if (!username) return fail(400, 'INVALID_USERNAME', 'Missing username.')

    const user = await User.findOne({ username }).lean()
    if (!user) return fail(404, 'NOT_FOUND', 'User not found.')

    const [questions, answers] = await Promise.all([
      Question.find({ authorId: user._id, status: { $ne: 'removed' } })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Answer.find({ authorId: user._id, deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate<{ questionId: { _id: unknown; title: string } | null }>({
          path: 'questionId',
          select: 'title'
        })
        .lean()
    ])

    return ok({
      user: {
        id: String(user._id),
        username: user.username,
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
        reputation: user.reputation ?? 0,
        questionCount: user.questionCount ?? 0,
        answerCount: user.answerCount ?? 0,
        acceptedAnswerCount: user.acceptedAnswerCount ?? 0,
        createdAt: (user as { createdAt: Date }).createdAt.toISOString()
      },
      questions: questions.map((q) => ({
        id: String(q._id),
        title: q.title,
        category: q.category,
        answerCount: q.answerCount,
        voteScore: q.voteScore,
        createdAt: (q as { createdAt: Date }).createdAt.toISOString()
      })),
      answers: answers.map((a) => ({
        id: String(a._id),
        body: a.body.slice(0, 200),
        voteScore: a.voteScore,
        questionId: a.questionId ? String(a.questionId._id) : null,
        questionTitle: a.questionId?.title ?? '(deleted question)',
        createdAt: (a as { createdAt: Date }).createdAt.toISOString()
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})