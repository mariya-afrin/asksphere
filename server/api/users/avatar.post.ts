// server/api/users/avatar.post.ts
// POST /api/users/avatar
// Accepts multipart/form-data upload of a profile picture.

import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { readMultipartFormData } from 'h3'
import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { requireUser } from '../../utils/auth'
import { ok, handleApiError, fail } from '../../utils/errors'

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const user = requireUser(event)

    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return fail(400, 'NO_FILE', 'No file was uploaded.')
    }

    const file = formData.find(
      (part) => part.name === 'avatar' || (part.type && part.type.startsWith('image/'))
    )

    if (!file || !file.data || file.data.length === 0) {
      return fail(400, 'NO_FILE', 'Please select an image file.')
    }

    const mime = file.type?.toLowerCase() || ''
    const ext = ALLOWED_MIME_TYPES[mime]
    if (!ext) {
      return fail(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, WebP, and GIF images are allowed.')
    }

    if (file.data.length > MAX_SIZE) {
      return fail(400, 'FILE_TOO_LARGE', 'File size must be 5 MB or less.')
    }

    // Prepare upload directory
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const filename = `${String(user._id)}-${uniqueSuffix}${ext}`
    const targetPath = path.join(uploadsDir, filename)

    // Remove previous locally uploaded avatar if it exists
    if (
      user.avatarUrl &&
      typeof user.avatarUrl === 'string' &&
      user.avatarUrl.startsWith('/uploads/avatars/')
    ) {
      const oldFilename = path.basename(user.avatarUrl)
      const oldPath = path.join(uploadsDir, oldFilename)
      try {
        await fs.unlink(oldPath)
      } catch {
        // Ignore if file does not exist
      }
    }

    // Save uploaded file
    await fs.writeFile(targetPath, file.data)

    const avatarUrl = `/uploads/avatars/${filename}`
    await User.updateOne({ _id: user._id }, { $set: { avatarUrl } })

    return ok({ avatarUrl })
  } catch (err) {
    handleApiError(err)
  }
})
