// server/api/admin/reports/[id].patch.ts
// PATCH /api/admin/reports/:id
// Body: { status: 'resolved' | 'dismissed', reviewNote?: string, removeContent?: boolean }

import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../../../models/Report'
import { Question } from '../../../models/Question'
import { Answer } from '../../../models/Answer'
import { Comment } from '../../../models/Comment'
import { connectDB } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

const schema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  reviewNote: z.string().trim().max(1000).default(''),
  removeContent: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const admin = requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid report ID.')
    }

    const raw = await readBody(event)
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }
    const { status, reviewNote, removeContent } = parsed.data

    const report = await Report.findById(id).lean()
    if (!report) return fail(404, 'NOT_FOUND', 'Report not found.')

    if (status === 'resolved' && removeContent) {
      // Soft-remove the offending content.
      if (report.targetType === 'question') {
        await Question.updateOne({ _id: report.targetId }, { $set: { status: 'removed' } })
      } else if (report.targetType === 'answer') {
        await Answer.updateOne({ _id: report.targetId }, { $set: { deletedAt: new Date() } })
      } else if (report.targetType === 'comment') {
        await Comment.updateOne({ _id: report.targetId }, { $set: { deletedAt: new Date() } })
      }
    }

    await Report.updateOne(
      { _id: id },
      {
        $set: {
          status,
          reviewNote,
          reviewedBy: admin._id,
          reviewedAt: new Date()
        }
      }
    )

    return ok({ id, status })
  } catch (err) {
    handleApiError(err)
  }
})