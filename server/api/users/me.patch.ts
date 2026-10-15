// server/api/users/me.patch.ts
// PATCH /api/users/me
// Update the current user's bio and avatar URL only.

import { z } from 'zod'
import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

const updateSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().trim().url().max(500).or(z.literal('')).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = requireUser(event)

    const raw = await readBody(event)
    const parsed = updateSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    // Only whitelisted fields. Role, status, reputation, passwordHash
    // are never updated here.
    const update: Record<string, unknown> = {}
    if (parsed.data.bio !== undefined) update.bio = parsed.data.bio
    if (parsed.data.avatarUrl !== undefined) update.avatarUrl = parsed.data.avatarUrl

    if (Object.keys(update).length === 0) {
      return fail(400, 'NO_CHANGES', 'Nothing to update.')
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: update }, { new: true }).lean()

    return ok({
      id: String(updated!._id),
      username: updated!.username,
      bio: updated!.bio ?? '',
      avatarUrl: updated!.avatarUrl ?? ''
    })
  } catch (err) {
    handleApiError(err)
  }
})