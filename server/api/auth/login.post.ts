// server/api/auth/login.post.ts

import { User } from '../../models/User'
import { connectDB } from '../../utils/db'
import { loginSchema } from '../../utils/validation'
import { verifyPassword } from '../../utils/password'
import { createSession } from '../../utils/session'
import { rateLimit } from '../../utils/rateLimit'
import { ok, handleApiError, fail } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Rate limit: 10 attempts per 10 minutes per IP.
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
    const rl = rateLimit(`login:${ip}`, 10, 10 * 60 * 1000)
    if (!rl.ok) {
      setHeader(event, 'Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000))
      return fail(429, 'RATE_LIMITED', 'Too many login attempts. Please wait a few minutes.')
    }

    const raw = await readBody(event)
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Please check your input.')
    }
    const { email, password } = parsed.data

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      return fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
    }

    if (user.status !== 'active') {
      return fail(403, 'SUSPENDED', 'This account is suspended.')
    }

    await createSession(event, String(user._id))

    return ok({
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role
    })
  } catch (err) {
    handleApiError(err)
  }
})