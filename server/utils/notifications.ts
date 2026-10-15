// server/utils/notifications.ts
// Helper to create notifications.
// Never notifies a user about their own action.

import { Notification } from '../models/Notification'
import mongoose from 'mongoose'

interface CreateNotificationInput {
  recipientId: string | mongoose.Types.ObjectId
  actorId: string | mongoose.Types.ObjectId
  type: 'answer' | 'comment' | 'accept' | 'vote'
  questionId?: string | mongoose.Types.ObjectId | null
  answerId?: string | mongoose.Types.ObjectId | null
  message: string
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  // Do not notify yourself.
  if (String(input.recipientId) === String(input.actorId)) return

  await Notification.create({
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    questionId: input.questionId ?? null,
    answerId: input.answerId ?? null,
    message: input.message
  })
}