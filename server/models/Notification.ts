// server/models/Notification.ts

import { Schema, model, type InferSchemaType } from 'mongoose'

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      required: true,
      enum: ['answer', 'comment', 'accept', 'vote']
    },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', default: null },
    answerId: { type: Schema.Types.ObjectId, ref: 'Answer', default: null },
    message: { type: String, default: '' },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
)

notificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 })

export type NotificationDoc = InferSchemaType<typeof notificationSchema>

export const Notification = model('Notification', notificationSchema)