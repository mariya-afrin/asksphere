// server/api/answers/[id]/vote.put.ts
// PUT /api/answers/:id/vote
// Body: { value: 1 | -1 }
// If the user already voted, replace the vote. Otherwise insert one.
// Then recompute the answer's voteScore from the votes collection.
//
// We compute the score from source (votes) rather than incrementing,
// because increments are prone to drift if a request fails midway.

import mongoose from 'mongoose'
import { Vote } from '../../../models/Vote'
import { Answer } from '../../../models/Answer'
import { User } from '../../../models/User'
import { connectDB } from '../../../utils/db'
import { requireUser } from '../../../utils/auth'
import { ok, handleApiError, fail } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = requireUser(event)

    const answerId = getRouterParam(event, 'id')
    if (!answerId || !mongoose.Types.ObjectId.isValid(answerId)) {
      return fail(400, 'INVALID_ID', 'Invalid answer ID.')
    }

    const body = await readBody<{ value?: number }>(event)
    const value = body?.value
    if (value !== 1 && value !== -1) {
      return fail(400, 'INVALID_VALUE', 'Vote value must be 1 or -1.')
    }

    const answer = await Answer.findById(answerId).lean()
    if (!answer || answer.deletedAt) return fail(404, 'NOT_FOUND', 'Answer not found.')

    // Policy: you cannot vote on your own answer.
    if (String(answer.authorId) === String(user._id)) {
      return fail(403, 'SELF_VOTE', 'You cannot vote on your own answer.')
    }

    // Upsert: insert if missing, update if present.
    // The unique index guarantees no duplicates.
    const previous = await Vote.findOneAndUpdate(
      { userId: user._id, answerId },
      { $set: { value } },
      { upsert: true, new: false } // new:false gives us the PREVIOUS doc (or null)
    ).lean()

    // Recompute score from all votes on this answer.
    const agg = await Vote.aggregate<{ _id: null; total: number }>([
      { $match: { answerId: new mongoose.Types.ObjectId(answerId) } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ])
    const score = agg[0]?.total ?? 0

    await Answer.updateOne({ _id: answerId }, { $set: { voteScore: score } })

    // Reputation: give the answer's author points for a new upvote, or
    // take away points on a change/downvote. Keep it simple:
    //   +10 when a user adds an upvote
    //   -10 when a user removes an upvote (changed to downvote or removed)
    //    2 when a user adds a downvote
    const authorId = String(answer.authorId)
    const previousValue = previous?.value ?? 0
    const delta = reputationDelta(previousValue, value)

    if (delta !== 0) {
      await User.updateOne({ _id: authorId }, { $inc: { reputation: delta } })
    }

    return ok({ voteScore: score, myVote: value })
  } catch (err) {
    handleApiError(err)
  }
})

/**
 * Map (previous vote, new vote) to a reputation change for the answer's author.
 * previous=0 means there was no prior vote.
 */
function reputationDelta(previous: number, next: number): number {
  // Upvote added
  if (previous === 0 && next === 1) return 10
  // Upvote removed (to downvote)
  if (previous === 1 && next === -1) return -12
  // Upvote removed entirely (handled by DELETE endpoint, but defensive)
  if (previous === 1 && next === 0) return -10
  // Downvote added
  if (previous === 0 && next === -1) return -2
  // Downvote removed (to upvote)
  if (previous === -1 && next === 1) return 12
  // Downvote removed entirely
  if (previous === -1 && next === 0) return 2
  // Same vote — no change
  return 0
}