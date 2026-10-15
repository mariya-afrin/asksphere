// server/utils/password.ts
// Wrapper around bcryptjs for hashing and verifying passwords.
// bcrypt is a one-way hash: you cannot recover the original password
// from the hash. This is exactly what we want for storage.

import bcrypt from 'bcryptjs'

// Cost factor: how slow the hash is. Higher = slower = harder to brute-force.
// 10 is a good balance for development. 12 is safer for production.
const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}