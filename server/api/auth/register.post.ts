// server/api/auth/register.post.ts

import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { registerSchema } from '../../utils/validation'
import { hashPassword } from '../../utils/password'
import { createSession } from '../../utils/session'
import { rateLimit } from '../../utils/rateLimit'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Rate limit: 5 registrations per hour per IP.
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
    const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.ok) {
      return fail(429, 'RATE_LIMITED', 'Too many accounts created from this network. Try later.')
    }

    const raw = await readBody(event)
    const parsed = registerSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.', parsed.error.flatten())
    }
    const { username, email, password } = parsed.data

    // Password policy beyond length: at least one letter and one digit.
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return fail(
        400,
        'WEAK_PASSWORD',
        'Password must contain at least one letter and one number.'
      )
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] }).lean()
    if (existing) {
      const field = existing.email === email ? 'email' : 'username'
      return fail(409, 'ALREADY_EXISTS', `That ${field} is already taken.`)
    }

    const passwordHash = await hashPassword(password)

    const created = await User.create({ username, email, passwordHash })

    await createSession(event, String(created._id))

    return ok({
      id: String(created._id),
      username: created.username,
      email: created.email,
      role: created.role
    })
  } catch (err) {
    handleApiError(err)
  }
})