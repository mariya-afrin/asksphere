// server/models/Comment.ts
// Comments can attach to either a question or an answer.
// `targetType` tells us which. `targetId` points at the specific doc.

import { Schema, model, type InferSchemaType } from 'mongoose'

const commentSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['question', 'answer'],
      index: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000
    },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 })

export type CommentDoc = InferSchemaType<typeof commentSchema>

export const Comment = model('Comment', commentSchema)