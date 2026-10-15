// server/api/admin/users/index.get.ts
// GET /api/admin/users

import { User } from '../../../models/User'
import { connectDB } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { ok, handleApiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    requireAdmin(event)

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .select('username email role status reputation questionCount answerCount createdAt')
      .lean()

    return ok({
      items: users.map((u) => ({
        id: String(u._id),
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        reputation: u.reputation ?? 0,
        questionCount: u.questionCount ?? 0,
        answerCount: u.answerCount ?? 0,
        createdAt: (u as { createdAt: Date }).createdAt.toISOString()
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})