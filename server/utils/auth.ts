// server/utils/auth.ts
// Helpers for requiring authentication / admin role in API routes.

import type { H3Event } from 'h3'
import { fail } from './errors'

/**
 * Throw a 401 if no user is attached to the event.
 * Use inside an API handler after the auth middleware has run.
 */
export function requireUser(event: H3Event) {
  const user = event.context.user
  if (!user) {
    fail(401, 'UNAUTHENTICATED', 'You must be logged in to do that.')
  }
  return user
}

/**
 * Throw a 403 if the user is not an admin.
 */
export function requireAdmin(event: H3Event) {
  const user = requireUser(event)
  if (user.role !== 'admin') {
    fail(403, 'FORBIDDEN', 'Admin access required.')
  }
  return user
}