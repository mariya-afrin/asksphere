// server/api/tags/index.get.ts
// Returns the top 50 tags by question count.

import { Question } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    await connectDB()

    const items = await Question.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'open' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 50 }
    ])

    return ok({
      items: items.map((t) => ({ tag: t._id, count: t.count }))
    })
  } catch (err) {
    handleApiError(err)
  }
})