// server/api/admin/stats.get.ts
// GET /api/admin/stats — admin only

import { User } from '../../models/User'
import { Question } from '../../models/Question'
import { Answer } from '../../models/Answer'
import { Report } from '../../models/Report'
import { connectDB } from '../../utils/db'
import { requireAdmin } from '../../utils/auth'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    requireAdmin(event)

    const [
      userCount,
      suspendedCount,
      questionCount,
      answerCount,
      pendingReports
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'suspended' }),
      Question.countDocuments({ status: { $ne: 'removed' } }),
      Answer.countDocuments({ deletedAt: null }),
      Report.countDocuments({ status: 'pending' })
    ])

    return ok({
      userCount,
      suspendedCount,
      questionCount,
      answerCount,
      pendingReports
    })
  } catch (err) {
    handleApiError(err)
  }
})