// server/api/categories/index.get.ts
// Returns each category with the number of open questions.

import { Question, CATEGORIES } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    await connectDB()

    const counts = await Question.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])

    const map = new Map(counts.map((c) => [c._id, c.count]))

    return ok({
      items: CATEGORIES.map((name) => ({
        name,
        slug: slugify(name),
        count: map.get(name) ?? 0
      }))
    })
  } catch (err) {
    handleApiError(err)
  }
})

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}