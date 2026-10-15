// server/models/Bookmark.ts
// A user's saved question. Unique index prevents duplicates.

import { Schema, model, type InferSchemaType } from 'mongoose'

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true
    }
  },
  { timestamps: true }
)

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true })

export type BookmarkDoc = InferSchemaType<typeof bookmarkSchema>

export const Bookmark = model('Bookmark', bookmarkSchema)