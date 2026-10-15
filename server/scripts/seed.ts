// server/scripts/seed.ts
// Run with:  npm run seed

import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '../models/User'
import { Question } from '../models/Question'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI missing in .env')

 console.log('Connecting to MongoDB...')

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  })
  console.log('Connected.')
} catch (err: any) {
  console.error('Connection error:', err.message)

  if (err.reason?.servers) {
    for (const [host, server] of err.reason.servers) {
      console.log(`\nServer: ${host}`)
      console.log('State:', server.type)
      console.log('Error:', server.error?.message ?? 'No detailed error')
    }
  }

  throw err
} 
  const sampleEmails = [
    'aya@example.com',
    'tariq@example.com',
    'noor@example.com',
    'rana@example.com',
    'leo@example.com'
  ]

  const sampleTitles = [
    'How do I start learning web development in 2026?',
    'Why does my MongoDB query return an empty array?',
    'Best way to memorise biology terms before an exam?',
    'Is a career switch into data science realistic at 35?',
    'How much water should I actually drink per day?'
  ]

  console.log('Clearing existing sample data...')
  await User.deleteMany({ email: { $in: sampleEmails } })
  await Question.deleteMany({ title: { $in: sampleTitles } })

  console.log('Creating sample users...')
  const users = await User.create([
    { username: 'aya_k', email: 'aya@example.com', passwordHash: 'seed-not-used' },
    { username: 'dev_tariq', email: 'tariq@example.com', passwordHash: 'seed-not-used' },
    { username: 'noor_study', email: 'noor@example.com', passwordHash: 'seed-not-used' },
    { username: 'rana_f', email: 'rana@example.com', passwordHash: 'seed-not-used' },
    { username: 'dr_leo', email: 'leo@example.com', passwordHash: 'seed-not-used' }
  ])

  const [aya, tariq, noor, rana, leo] = users

  console.log('Creating sample questions...')
  await Question.create([
    {
      title: 'How do I start learning web development in 2026?',
      body: 'I want to become a web developer but there are so many tutorials. Where should a complete beginner actually start? I know HTML a little and want a realistic path.',
      category: 'Programming',
      tags: ['javascript', 'beginners', 'career'],
      authorId: aya._id,
      answerCount: 4,
      viewCount: 312,
      voteScore: 12
    },
    {
      title: 'Why does my MongoDB query return an empty array?',
      body: 'I am using Mongoose and my find() call always returns []. The data exists in Atlas and I can see it in the UI. What am I missing? The collection name matches.',
      category: 'Programming',
      tags: ['mongodb', 'mongoose'],
      authorId: tariq._id,
      answerCount: 2,
      viewCount: 128,
      voteScore: 8
    },
    {
      title: 'Best way to memorise biology terms before an exam?',
      body: 'I have a biology exam in two weeks and hundreds of terms to learn. Any study techniques that actually work for memorisation under time pressure?',
      category: 'Education',
      tags: ['study-tips', 'biology'],
      authorId: noor._id,
      answerCount: 0,
      viewCount: 74,
      voteScore: 2
    },
    {
      title: 'Is a career switch into data science realistic at 35?',
      body: 'I have ten years of experience in finance. I have been learning Python for a year. Realistically, what is the path to a data science role at my age?',
      category: 'Career',
      tags: ['career-change', 'data-science'],
      authorId: rana._id,
      answerCount: 6,
      viewCount: 512,
      voteScore: 24
    },
    {
      title: 'How much water should I actually drink per day?',
      body: 'I keep hearing different numbers — 8 glasses, 2 litres, more in summer. Is there a real scientific answer, or is 8 glasses a myth?',
      category: 'Health and Wellness',
      tags: ['nutrition', 'hydration'],
      authorId: leo._id,
      answerCount: 3,
      viewCount: 190,
      voteScore: 6
    }
  ])

  console.log('Seed complete. Inserted 5 users and 5 questions.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})