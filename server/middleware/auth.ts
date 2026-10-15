// server/middleware/auth.ts
// Runs on every request. Loads the logged-in user (if any)
// and attaches them to event.context.user.

import { connectDB } from '../utils/db'
import { getSessionUser } from '../utils/session'

export default defineEventHandler(async (event) => {
  // Only run for API routes. Static assets do not need database lookups.
  if (!event.path.startsWith('/api/')) return

  try {
    await connectDB()
    const user = await getSessionUser(event)
    event.context.user = user
  } catch (err) {
    // Do not crash the request if the DB is down; just log and continue
    // with no user. The route will decide what to do.
    console.error('[middleware/auth] Failed to load session user:', err)
    event.context.user = null
  }
})