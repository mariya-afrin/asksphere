// server/api/bookmarks/index.get.ts
// GET /api/bookmarks
// Returns the current user's bookmarked questions, newest first.

import { Bookmark } from '../../models/Bookmark'
import { Question } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const bookmarks = await Bookmark.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const questionIds = bookmarks.map((b) => b.questionId)

    const questions = await Question.find({
      _id: { $in: questionIds },
      status: { $ne: 'removed' }
    })
      .populate<{ authorId: { username: string } | null }>({
        path: 'authorId',
        select: 'username'
      })
      .lean()

    // Preserve bookmark order (newest bookmark first).
    const byId = new Map(questions.map((q) => [String(q._id), q]))
    const items = questionIds
      .map((qid) => byId.get(String(qid)))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .map((q) => ({
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

    return ok({ items })
  } catch (err) {
    handleApiError(err)
  }
})