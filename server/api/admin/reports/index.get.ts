// server/api/admin/reports/index.get.ts
// GET /api/admin/reports?status=pending

import { Report } from '../../../models/Report'
import { User } from '../../../models/User'
import { connectDB } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { ok, handleApiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    requireAdmin(event)

    const query = getQuery(event)
    const status = ['pending', 'resolved', 'dismissed'].includes(String(query.status))
      ? String(query.status)
      : 'pending'

    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate<{ reporterId: { _id: unknown; username: string } | null }>({
        path: 'reporterId',
        select: 'username'
      })
      .lean()

    return ok({
      items: reports.map((r) => ({
        id: String(r._id),
        targetType: r.targetType,
        targetId: String(r.targetId),
        reason: r.reason,
        details: r.details,
        status: r.status,
        createdAt: (r as { createdAt: Date }).createdAt.toISOString(),
        reporter: r.reporterId
          ? { id: String(r.reporterId._id), username: r.reporterId.username }
          : { id: null, username: 'deleted-user' }
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})
