// server/models/Vote.ts
// One document per (user, answer) pair.
// The unique index prevents duplicate votes at the database level.

import { Schema, model, type InferSchemaType } from 'mongoose'

const voteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    answerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
      index: true
    },
    value: {
      type: Number,
      required: true,
      enum: [1, -1]
    }
  },
  { timestamps: true }
)

// Compound unique index: a user can have at most one vote per answer.
voteSchema.index({ userId: 1, answerId: 1 }, { unique: true })

export type VoteDoc = InferSchemaType<typeof voteSchema>

export const Vote = model('Vote', voteSchema)