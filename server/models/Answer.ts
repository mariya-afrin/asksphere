// server/models/Answer.ts

import { Schema, model, type InferSchemaType } from 'mongoose'

const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10000
    },
    voteScore: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

answerSchema.index({ questionId: 1, voteScore: -1 })
answerSchema.index({ questionId: 1, createdAt: 1 })

export type AnswerDoc = InferSchemaType<typeof answerSchema>

export const Answer = model('Answer', answerSchema)