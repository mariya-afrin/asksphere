// server/utils/db.ts
// Manages a single shared Mongoose connection for the whole server.

import mongoose from 'mongoose'

let cached: {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
} = {
  conn: null,
  promise: null
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Check your .env file.')
    }

    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}