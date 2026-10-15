// server/api/leaderboard/index.get.ts
// Returns the top 50 users by reputation.

import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    await connectDB()

    const users = await User.find({ status: 'active' })
      .sort({ reputation: -1, answerCount: -1, questionCount: -1 })
      .limit(50)
      .select('username avatarUrl reputation questionCount answerCount acceptedAnswerCount createdAt')
      .lean()

    return ok({
      items: users.map((u) => ({
        id: String(u._id),
        username: u.username,
        avatarUrl: u.avatarUrl ?? '',
        reputation: u.reputation ?? 0,
        questionCount: u.questionCount ?? 0,
        answerCount: u.answerCount ?? 0,
        acceptedAnswerCount: u.acceptedAnswerCount ?? 0
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})