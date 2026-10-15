// server/api/reports/index.post.ts
// POST /api/reports

import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../../models/Report'
import { Question } from '../../models/Question'
import { Answer } from '../../models/Answer'
import { Comment } from '../../models/Comment'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

const schema = z.object({
  targetType: z.enum(['question', 'answer', 'comment']),
  targetId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid target ID.'),
  reason: z.enum(['spam', 'abuse', 'off-topic', 'duplicate', 'other']),
  details: z.string().trim().max(1000).default('')
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const raw = await readBody(event)
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }
    const { targetType, targetId, reason, details } = parsed.data

    // Verify the target exists. Prevents reporting random ObjectIds.
    if (targetType === 'question') {
      const exists = await Question.exists({ _id: targetId })
      if (!exists) return fail(404, 'NOT_FOUND', 'Question not found.')
    } else if (targetType === 'answer') {
      const exists = await Answer.exists({ _id: targetId, deletedAt: null })
      if (!exists) return fail(404, 'NOT_FOUND', 'Answer not found.')
    } else {
      const exists = await Comment.exists({ _id: targetId, deletedAt: null })
      if (!exists) return fail(404, 'NOT_FOUND', 'Comment not found.')
    }

    // Rate limiting: prevent more than 5 reports by the same user in one hour.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await Report.countDocuments({
      reporterId: user._id,
      createdAt: { $gte: oneHourAgo }
    })
    if (recentCount >= 5) {
      return fail(429, 'RATE_LIMITED', 'Too many reports. Please try again later.')
    }

    const report = await Report.create({
      reporterId: user._id,
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      reason,
      details
    })

    return ok({ id: String(report._id) })
  } catch (err) {
    handleApiError(err)
  }
})