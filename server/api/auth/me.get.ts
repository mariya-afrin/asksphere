// server/api/auth/me.get.ts
// GET /api/auth/me
// Returns the current user or null.

import { connectDB } from '../../utils/db'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = event.context.user
    if (!user) {
      return ok({ user: null })
    }

    return ok({
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation ?? 0,
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
        questionCount: user.questionCount ?? 0,
        answerCount: user.answerCount ?? 0,
        acceptedAnswerCount: user.acceptedAnswerCount ?? 0
      }
    })
  } catch (err) {
    handleApiError(err)
  }
})