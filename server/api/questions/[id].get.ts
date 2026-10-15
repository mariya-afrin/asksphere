// server/api/questions/[id].get.ts
// GET /api/questions/:id
// Returns one question by ID. Increments viewCount.

import mongoose from 'mongoose'
import { Question } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    // Increment view count atomically and fetch in one round trip.
    const doc = await Question.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate<{ authorId: { _id: unknown; username: string; avatarUrl?: string; reputation?: number } | null }>({
        path: 'authorId',
        select: 'username avatarUrl reputation'
      })
      .lean()

    if (!doc) return fail(404, 'NOT_FOUND', 'Question not found.')

    return ok({
      id: String(doc._id),
      title: doc.title,
      body: doc.body,
      category: doc.category,
      tags: doc.tags ?? [],
      answerCount: doc.answerCount,
      viewCount: doc.viewCount,
      voteScore: doc.voteScore,
      acceptedAnswerId: doc.acceptedAnswerId ? String(doc.acceptedAnswerId) : null,
      status: doc.status,
      createdAt: (doc as { createdAt: Date }).createdAt.toISOString(),
      updatedAt: (doc as { updatedAt: Date }).updatedAt.toISOString(),
      author: doc.authorId
        ? {
            id: String(doc.authorId._id),
            username: doc.authorId.username,
            avatarUrl: doc.authorId.avatarUrl ?? '',
            reputation: doc.authorId.reputation ?? 0
          }
        : { id: null, username: 'deleted-user', avatarUrl: '', reputation: 0 }
    })
  } catch (err) {
    handleApiError(err)
  }
})