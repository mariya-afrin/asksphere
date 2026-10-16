// server/scripts/remove-dummy-posts.ts
// Run with: npm run clean:seed  or  npx tsx server/scripts/remove-dummy-posts.ts

import 'dotenv/config'
import dns from 'node:dns'
import mongoose from 'mongoose'
import { User } from '../models/User'
import { Question } from '../models/Question'
import { Answer } from '../models/Answer'
import { Comment } from '../models/Comment'
import { Bookmark } from '../models/Bookmark'
import { Vote } from '../models/Vote'
import { Notification } from '../models/Notification'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // Ignore if restricted
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI missing in .env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  })
  console.log('Connected.')

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

  // Find sample users
  const dummyUsers = await User.find({ email: { $in: sampleEmails } })
  const dummyUserIds = dummyUsers.map(u => u._id)

  // Find dummy questions
  const dummyQuestions = await Question.find({
    $or: [
      { title: { $in: sampleTitles } },
      { authorId: { $in: dummyUserIds } }
    ]
  })
  const dummyQuestionIds = dummyQuestions.map(q => q._id)

  console.log(`Found ${dummyQuestions.length} dummy questions to remove:`)
  for (const q of dummyQuestions) {
    console.log(` - [${q._id}] ${q.title}`)
  }

  console.log(`Found ${dummyUsers.length} dummy users to remove:`)
  for (const u of dummyUsers) {
    console.log(` - [${u._id}] ${u.username} (${u.email})`)
  }

  // Clean up any associated child records if they exist
  if (dummyQuestionIds.length > 0 || dummyUserIds.length > 0) {
    const deletedAnswers = await Answer.deleteMany({
      $or: [
        { questionId: { $in: dummyQuestionIds } },
        { authorId: { $in: dummyUserIds } }
      ]
    })
    console.log(`Deleted answers: ${deletedAnswers.deletedCount}`)

    const deletedComments = await Comment.deleteMany({
      $or: [
        { questionId: { $in: dummyQuestionIds } },
        { authorId: { $in: dummyUserIds } }
      ]
    })
    console.log(`Deleted comments: ${deletedComments.deletedCount}`)

    const deletedBookmarks = await Bookmark.deleteMany({
      $or: [
        { questionId: { $in: dummyQuestionIds } },
        { userId: { $in: dummyUserIds } }
      ]
    })
    console.log(`Deleted bookmarks: ${deletedBookmarks.deletedCount}`)

    const deletedVotes = await Vote.deleteMany({
      $or: [
        { targetId: { $in: dummyQuestionIds } },
        { userId: { $in: dummyUserIds } }
      ]
    })
    console.log(`Deleted votes: ${deletedVotes.deletedCount}`)

    const deletedNotifications = await Notification.deleteMany({
      $or: [
        { recipientId: { $in: dummyUserIds } },
        { actorId: { $in: dummyUserIds } },
        { questionId: { $in: dummyQuestionIds } }
      ]
    })
    console.log(`Deleted notifications: ${deletedNotifications.deletedCount}`)
  }

  // Delete dummy questions
  const resQuestions = await Question.deleteMany({ _id: { $in: dummyQuestionIds } })
  console.log(`Deleted ${resQuestions.deletedCount} dummy questions.`)

  // Delete dummy users
  const resUsers = await User.deleteMany({ _id: { $in: dummyUserIds } })
  console.log(`Deleted ${resUsers.deletedCount} dummy users.`)

  console.log('Cleanup complete.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Removal failed:', err)
  process.exit(1)
})
