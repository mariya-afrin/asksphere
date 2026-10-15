// server/api/questions/[id].patch.ts
// PATCH /api/questions/:id
// Only the author can edit. Only whitelisted fields are updated.

import mongoose from 'mongoose'
import { Question } from '../../models/Question'
import { connectDB } from '../../utils/db'
import { questionUpdateSchema } from '../../utils/validation'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = requireUser(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid question ID.')
    }

    const existing = await Question.findById(id).lean()
    if (!existing) return fail(404, 'NOT_FOUND', 'Question not found.')

    // Ownership check on the SERVER. Hiding the edit button in the UI
    // is not enough — anyone can send a request with curl.
    if (String(existing.authorId) !== String(user._id) && user.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'You can only edit your own questions.')
    }

    const raw = await readBody(event)
    const parsed = questionUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    // Build the update from validated fields only.
    // Mass-assignment protection: we never pass the raw body to $set.
    const update: Record<string, unknown> = {}
    for (const key of ['title', 'body', 'category', 'tags'] as const) {
      if (parsed.data[key] !== undefined) update[key] = parsed.data[key]
    }

    if (Object.keys(update).length === 0) {
      return fail(400, 'NO_CHANGES', 'Nothing to update.')
    }

    const updated = await Question.findByIdAndUpdate(id, { $set: update }, { new: true }).lean()

    return ok({
      id: String(updated!._id),
      title: updated!.title,
      body: updated!.body,
      category: updated!.category,
      tags: updated!.tags ?? [],
      updatedAt: (updated as { updatedAt: Date }).updatedAt.toISOString()
    })
  } catch (err) {
    handleApiError(err)
  }
})