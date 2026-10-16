// server/api/users/avatar.delete.ts
// DELETE /api/users/avatar
// Removes the current user's profile picture.

import path from 'node:path'
import fs from 'node:fs/promises'
import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    if (
      user.avatarUrl &&
      typeof user.avatarUrl === 'string' &&
      user.avatarUrl.startsWith('/uploads/avatars/')
    ) {
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'avatars')
      const oldFilename = path.basename(user.avatarUrl)
      const oldPath = path.join(uploadsDir, oldFilename)
      try {
        await fs.unlink(oldPath)
      } catch {
        // Ignore if file does not exist
      }
    }

    await User.updateOne({ _id: user._id }, { $set: { avatarUrl: '' } })

    return ok({ avatarUrl: '' })
  } catch (err) {
    handleApiError(err)
  }
})
