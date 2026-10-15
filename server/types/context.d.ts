// server/types/context.d.ts
// Extends Nitro's H3EventContext to include our custom `user` field.

import type { HydratedDocument } from 'mongoose'
import type { UserDoc } from '../models/User'

declare module 'h3' {
  interface H3EventContext {
    user?: HydratedDocument<UserDoc> | null
  }
}

export {}