// server/utils/validation.ts

import { z } from 'zod'
import { CATEGORIES } from '../models/Question'

// ---------- Auth ----------

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
})

export type LoginInput = z.infer<typeof loginSchema>

// ---------- Questions ----------

export const questionCreateSchema = z.object({
  title: z.string().trim().min(10).max(200),
  body: z.string().trim().min(20).max(10000),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string().trim().min(1).max(30)).max(5).default([])
    .transform((tags) => Array.from(new Set(tags.map((t) => t.toLowerCase().replace(/\s+/g, '-')))))
})

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>

export const questionUpdateSchema = questionCreateSchema.partial()
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>

export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(200).optional(),
  category: z.enum(CATEGORIES).optional(),
  tag: z.string().trim().max(30).optional(),
  sort: z.enum(['latest', 'popular', 'unanswered']).default('latest'),
  status: z.enum(['open', 'closed', 'removed']).default('open')
})

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>

// ---------- Answers ----------

export const answerCreateSchema = z.object({
  body: z.string().trim().min(10).max(10000)
})
export type AnswerCreateInput = z.infer<typeof answerCreateSchema>
export const answerUpdateSchema = answerCreateSchema

// ---------- Comments ----------

export const commentCreateSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty.').max(1000)
})
export type CommentCreateInput = z.infer<typeof commentCreateSchema>

export const commentUpdateSchema = commentCreateSchema
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>