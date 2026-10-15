import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  questionCreateSchema,
  commentCreateSchema
} from '../../server/utils/validation'

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({
      username: 'alice_1',
      email: 'alice@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      username: 'alice_1',
      email: 'alice@example.com',
      password: 'Password1',
      confirmPassword: 'Password2'
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid usernames', () => {
    const result = registerSchema.safeParse({
      username: 'a b',
      email: 'alice@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    })
    expect(result.success).toBe(false)
  })
})

describe('questionCreateSchema', () => {
  it('normalizes tags', () => {
    const result = questionCreateSchema.safeParse({
      title: 'This is a valid title',
      body: 'This is a valid body that is definitely long enough.',
      category: 'Programming',
      tags: ['JavaScript', 'Nuxt JS']
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(['javascript', 'nuxt-js'])
    }
  })

  it('rejects too many tags', () => {
    const result = questionCreateSchema.safeParse({
      title: 'This is a valid title',
      body: 'This is a valid body that is definitely long enough.',
      category: 'Programming',
      tags: ['a', 'b', 'c', 'd', 'e', 'f']
    })
    expect(result.success).toBe(false)
  })
})

describe('commentCreateSchema', () => {
  it('rejects empty comments', () => {
    expect(commentCreateSchema.safeParse({ body: '   ' }).success).toBe(false)
  })
  it('accepts a normal comment', () => {
    expect(commentCreateSchema.safeParse({ body: 'Nice answer.' }).success).toBe(true)
  })
})