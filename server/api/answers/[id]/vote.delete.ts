// server/api/answers/[id]/vote.delete.ts
// DELETE /api/answers/:id/vote
// Removes the current user's vote if it exists.

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

    const answer = await Answer.findById(answerId).lean()
    if (!answer || answer.deletedAt) return fail(404, 'NOT_FOUND', 'Answer not found.')

    const previous = await Vote.findOneAndDelete({ userId: user._id, answerId }).lean()

    // Recompute score.
    const agg = await Vote.aggregate<{ _id: null; total: number }>([
      { $match: { answerId: new mongoose.Types.ObjectId(answerId) } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ])
    const score = agg[0]?.total ?? 0

    await Answer.updateOne({ _id: answerId }, { $set: { voteScore: score } })

    // Reputation: undo the effect of the previous vote.
    if (previous) {
      const authorId = String(answer.authorId)
      let delta = 0
      if (previous.value === 1) delta = -10
      else if (previous.value === -1) delta = 2
      if (delta !== 0) {
        await User.updateOne({ _id: authorId }, { $inc: { reputation: delta } })
      }
    }

    return ok({ voteScore: score, myVote: 0 })
  } catch (err) {
    handleApiError(err)
  }
})