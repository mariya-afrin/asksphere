// server/models/Question.ts

import { Schema, model, type InferSchemaType } from 'mongoose'

export const CATEGORIES = [
  'Technology',
  'Programming',
  'Science',
  'Mathematics',
  'Education',
  'Career',
  'Business',
  'Health and Wellness',
  'Lifestyle',
  'General Knowledge',
  'Other'
] as const

export type Category = (typeof CATEGORIES)[number]

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 10000
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: 'A question may have at most 5 tags.'
      }
    },
    answerCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 },
    acceptedAnswerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      default: null
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'removed'],
      default: 'open'
    }
  },
  { timestamps: true }
)

questionSchema.index({ createdAt: -1 })
questionSchema.index({ voteScore: -1, answerCount: -1 })
questionSchema.index({ category: 1, createdAt: -1 })
questionSchema.index({ tags: 1 })
questionSchema.index(
  { title: 'text', body: 'text' },
  { weights: { title: 5, body: 1 }, name: 'question_text_idx' }
)

export type QuestionDoc = InferSchemaType<typeof questionSchema>

export const Question = model('Question', questionSchema)