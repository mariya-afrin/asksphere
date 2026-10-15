// server/api/admin/users/[id].patch.ts
// Body: { status?: 'active' | 'suspended', role?: 'user' | 'admin' }
// Admins cannot demote themselves or suspend themselves.

import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../../../models/User'
import { Session } from '../../../models/Session'
import { connectDB } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

const schema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  role: z.enum(['user', 'admin']).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const admin = requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return fail(400, 'INVALID_ID', 'Invalid user ID.')
    }

    // Prevent self-modification of role/status.
    if (String(admin._id) === id) {
      return fail(400, 'SELF_MODIFY', 'You cannot change your own role or status.')
    }

    const raw = await readBody(event)
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }

    if (Object.keys(parsed.data).length === 0) {
      return fail(400, 'NO_CHANGES', 'Nothing to update.')
    }

    await User.updateOne({ _id: id }, { $set: parsed.data })

    // If the user was suspended, invalidate all their sessions.
    if (parsed.data.status === 'suspended') {
      await Session.deleteMany({ userId: id })
    }

    const updated = await User.findById(id)
      .select('username email role status')
      .lean()

    return ok({
      id: String(updated!._id),
      username: updated!.username,
      email: updated!.email,
      role: updated!.role,
      status: updated!.status
    })
  } catch (err) {
    handleApiError(err)
  }
})