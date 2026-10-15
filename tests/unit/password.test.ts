import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../../server/utils/password'

describe('password hashing', () => {
  it('produces a bcrypt hash that is not the plaintext', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(hash).not.toBe('correct horse battery staple')
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('verifies the correct password', async () => {
    const hash = await hashPassword('S3cretPass1')
    expect(await verifyPassword('S3cretPass1', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('S3cretPass1')
    expect(await verifyPassword('S3cretPass2', hash)).toBe(false)
  })

  it('produces different hashes for the same password (salt is unique)', async () => {
    const h1 = await hashPassword('samePassword1')
    const h2 = await hashPassword('samePassword1')
    expect(h1).not.toBe(h2)
  })
})