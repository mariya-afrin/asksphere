// server/api/questions/index.get.ts
// GET /api/questions

import { Question } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { questionListQuerySchema } from '../../utils/validation'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const raw = getQuery(event)
    const parsed = questionListQuerySchema.safeParse(raw)
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Invalid query parameters.',
        parsed.error.flatten()
      )
    }
    const { page, limit, search, category, tag, sort, status } = parsed.data

    const filter: Record<string, unknown> = { status }
    if (category) filter.category = category
    if (tag) filter.tags = tag.toLowerCase()
    if (sort === 'unanswered') filter.answerCount = 0
    if (search) filter.$text = { $search: search }

    let sortSpec: Record<string, 1 | -1> = { createdAt: -1 }
    if (sort === 'popular') {
      sortSpec = { voteScore: -1, answerCount: -1, createdAt: -1 }
    }

    const skip = (page - 1) * limit
    const [total, docs] = await Promise.all([
      Question.countDocuments(filter),
      Question.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .populate<{ authorId: { username: string } | null }>({
          path: 'authorId',
          select: 'username'
        })
        .lean()
    ])

    const items = docs.map((q) => ({
      id: String(q._id),
      title: q.title,
      excerpt: q.body.slice(0, 200),
      category: q.category,
      tags: q.tags ?? [],
      answerCount: q.answerCount,
      viewCount: q.viewCount,
      voteScore: q.voteScore,
      createdAt: (q as { createdAt: Date }).createdAt.toISOString(),
      author: { username: q.authorId?.username ?? 'deleted-user' }
    }))

    return ok({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0
    })
  } catch (err) {
    handleApiError(err)
  }
})