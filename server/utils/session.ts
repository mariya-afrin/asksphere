// server/utils/session.ts
// Creates, verifies, and deletes user sessions.

import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { Session } from '../models/Session'
import { User } from '../models/User'

const COOKIE_NAME = 'asksphere_session'
const SESSION_DAYS = 30

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate a random token, store its hash in the Session collection,
 * and set the cookie on the response. Returns the user's _id as a string.
 */
export async function createSession(
  event: H3Event,
  userId: string
): Promise<void> {
  const token = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashToken(token)

  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await Session.create({
    tokenHash,
    userId,
    expiresAt,
    userAgent: getHeader(event, 'user-agent') ?? '',
    ipAddress: getRequestIP(event, { xForwardedFor: true }) ?? ''
  })

  // isProduction = true when NODE_ENV=production.
  const isProd = process.env.NODE_ENV === 'production'

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,             // JavaScript cannot read this cookie
    secure: isProd,             // Only send over HTTPS in production
    sameSite: 'lax',            // Protect against CSRF
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60, // in seconds
    expires: expiresAt
  })
}

/**
 * Read the session cookie, verify it, and return the user document.
 * Returns null if there is no valid session.
 */
export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null

  const tokenHash = hashToken(token)
  const session = await Session.findOne({ tokenHash }).lean()
  if (!session) return null

  if (session.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ _id: session._id })
    return null
  }

  const user = await User.findById(session.userId).lean()
  if (!user || user.status !== 'active') return null

  return user
}

/**
 * Delete the current session and clear the cookie.
 */
export async function destroySession(event: H3Event): Promise<void> {
  const token = getCookie(event, COOKIE_NAME)
  if (token) {
    const tokenHash = hashToken(token)
    await Session.deleteOne({ tokenHash })
  }
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}