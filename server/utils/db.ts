// server/utils/db.ts
// Manages a single shared Mongoose connection for the whole server.

import dns from 'node:dns'
import mongoose from 'mongoose'

// On Windows, Node's internal resolver can fail on SRV records with ECONNREFUSED.
// Setting public DNS servers (Google & Cloudflare) allows mongodb+srv:// to resolve cleanly.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // Fall back to system defaults if restricted
}

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