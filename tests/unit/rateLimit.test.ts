import { describe, it, expect } from 'vitest'
import { rateLimit } from '../../server/utils/rateLimit'

describe('rateLimit', () => {
  it('allows up to the limit', () => {
    const key = `test:${Math.random()}`
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true)
    }
    expect(rateLimit(key, 3, 60_000).ok).toBe(false)
  })

  it('tracks remaining count', () => {
    const key = `test:${Math.random()}`
    expect(rateLimit(key, 5, 60_000).remaining).toBe(4)
    expect(rateLimit(key, 5, 60_000).remaining).toBe(3)
  })
})