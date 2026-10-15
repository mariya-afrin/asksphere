<template>
  <article
    class="card p-5 transition-colors"
    :class="answer.isAccepted ? 'border-success/50 bg-success/5' : ''"
  >
    <div class="flex items-start gap-4">
      <!-- Vote column -->
      <VoteButtons
        :score="answer.voteScore"
        :my-vote="answer.myVote"
        :can-vote="canVote"
        @up="$emit('vote', { id: answer.id, value: 1 })"
        @down="$emit('vote', { id: answer.id, value: -1 })"
      />

      <div class="flex-1 min-w-0">
        <div
          v-if="answer.isAccepted"
          class="mb-2 inline-flex items-center gap-1 text-xs font-medium text-success"
        >
          <CheckCircle2 class="h-4 w-4" />
          Accepted answer
        </div>

        <div class="text-ink whitespace-pre-wrap text-sm leading-relaxed">
          {{ answer.body }}
        </div>

        <div
          class="mt-4 flex items-center justify-between gap-3 text-xs text-ink-muted"
        >
          <span>
            Answered by
            <NuxtLink
              :to="`/users/${answer.author.username}`"
              class="link"
            >
              {{ answer.author.username }}
            </NuxtLink>
            · reputation {{ answer.author.reputation }}
          </span>
          <time :datetime="answer.createdAt">
            {{ new Date(answer.createdAt).toLocaleString() }}
          </time>
        </div>

        <!-- Action row: accept / edit / delete / report -->
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button
            v-if="canAccept && !answer.isAccepted"
            type="button"
            class="btn-secondary text-xs"
            @click="$emit('accept', answer.id)"
          >
            Accept this answer
          </button>
          <template v-if="isAuthor">
            <button
              type="button"
              class="btn-secondary text-xs"
              @click="$emit('edit', answer.id)"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn-danger text-xs"
              @click="$emit('delete', answer.id)"
            >
              Delete
            </button>
          </template>
          <ReportButton
            v-if="currentUserId && !isAuthor"
            target-type="answer"
            :target-id="answer.id"
          />
        </div>

        <!-- Comments -->
        <div
          class="mt-4 border-t border-surface-border pt-3 space-y-2"
        >
          <CommentList
            :comments="answer.comments ?? []"
            :current-user-id="currentUserId"
            :is-admin="isAdmin"
            @update="(payload) => $emit('comment-update', payload)"
            @delete="(id) => $emit('comment-delete', id)"
          />
          <CommentForm
            :can-comment="!!currentUserId"
            @submit="(body) => $emit('comment-create', { answerId: answer.id, body })"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { computed } from 'vue'
import ReportButton from './ReportButton.vue'

interface CommentItem {
  id: string
  body: string
  createdAt: string
  author: { id: string | null; username: string }
}

interface AnswerData {
  id: string
  body: string
  voteScore: number
  myVote: number
  isAccepted: boolean
  createdAt: string
  updatedAt: string
  comments?: CommentItem[]
  author: {
    id: string | null
    username: string
    avatarUrl: string
    reputation: number
  }
}

const props = defineProps<{
  answer: AnswerData
  currentUserId?: string | null
  questionAuthorId?: string | null
  isAdmin?: boolean
}>()

defineEmits<{
  accept: [id: string]
  edit: [id: string]
  delete: [id: string]
  vote: [{ id: string; value: 1 | -1 }]
  'comment-create': [{ answerId: string; body: string }]
  'comment-update': [{ id: string; body: string }]
  'comment-delete': [id: string]
}>()

const isAuthor = computed(
  () =>
    !!props.currentUserId && props.answer.author.id === props.currentUserId
)

const canAccept = computed(() => {
  if (!props.currentUserId) return false
  if (props.answer.isAccepted) return false
  return (
    props.currentUserId === props.questionAuthorId ||
    props.isAdmin === true
  )
})

const canVote = computed(() => {
  if (!props.currentUserId) return false
  return props.currentUserId !== props.answer.author.id
})
</script>