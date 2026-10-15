// server/api/questions/index.post.ts
// POST /api/questions
// Requires a logged-in session. The author is derived from the session,
// NOT from the request body.

import { Question } from '../../models/Question'
import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { questionCreateSchema } from '../../utils/validation'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Throws 401 if not logged in.
    const user = requireUser(event)

    const raw = await readBody(event)
    const parsed = questionCreateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Please check your input.',
        parsed.error.flatten()
      )
    }

    const { title, body, category, tags } = parsed.data

    const created = await Question.create({
      title,
      body,
      category,
      tags,
      authorId: user._id,
      answerCount: 0,
      viewCount: 0,
      voteScore: 0,
      status: 'open'
    })

    await User.updateOne({ _id: user._id }, { $inc: { questionCount: 1 } })

    return ok({
      id: String(created._id),
      title: created.title,
      body: created.body,
      category: created.category,
      tags: created.tags,
      createdAt: created.createdAt.toISOString()
    })
  } catch (err) {
    handleApiError(err)
  }
})