// server/models/User.ts

import { Schema, model, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_.-]+$/
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    bio: { type: String, default: '', maxlength: 500 },
    avatarUrl: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    reputation: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    acceptedAnswerCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

userSchema.index({ createdAt: -1 })

export type UserDoc = InferSchemaType<typeof userSchema>

export const User = model('User', userSchema)