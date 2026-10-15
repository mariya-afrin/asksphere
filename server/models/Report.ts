// server/models/Report.ts

import { Schema, model, type InferSchemaType } from 'mongoose'

const reportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['question', 'answer', 'comment'],
      index: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'abuse', 'off-topic', 'duplicate', 'other']
    },
    details: { type: String, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: '' }
  },
  { timestamps: true }
)

reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 })

export type ReportDoc = InferSchemaType<typeof reportSchema>

export const Report = model('Report', reportSchema)