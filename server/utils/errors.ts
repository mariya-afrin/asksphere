// server/utils/errors.ts
// Helper functions for producing consistent JSON responses.

import { H3Error, createError } from 'h3'

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

export function fail(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): never {
  throw createError({
    statusCode,
    statusMessage: message,
    data: { success: false, error: { code, message, details } }
  })
}

export function handleApiError(err: unknown): never {
  if (err instanceof H3Error) throw err

  console.error('[api] Unexpected error:', err)

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error',
    data: {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' }
    }
  })
}

export function assertFound<T>(
  value: T | null | undefined,
  what: string
): asserts value is T {
  if (value === null || value === undefined) {
    fail(404, 'NOT_FOUND', `${what} not found.`)
  }
}