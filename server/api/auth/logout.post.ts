// server/api/auth/logout.post.ts
// POST /api/auth/logout

import { connectDB } from '../../utils/db'
import { destroySession } from '../../utils/session'
import { ok, handleApiError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    await destroySession(event)
    return ok({ loggedOut: true })
  } catch (err) {
    handleApiError(err)
  }
})