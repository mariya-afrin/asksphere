// server/models/Session.ts
// A session is a server-side record of a logged-in user.
// The browser holds a random session ID in a cookie.
// The server looks up that ID to find the user.

import { Schema, model, type InferSchemaType } from 'mongoose'

const sessionSchema = new Schema(
  {
    // Random 64-byte hex string. This is the session ID.
    // We store it hashed (SHA-256) so that even if the database leaks,
    // the attacker cannot forge a session without knowing the original.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // When the session expires. After this date the cookie is invalid.
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: true }
)

export type SessionDoc = InferSchemaType<typeof sessionSchema>

export const Session = model('Session', sessionSchema)