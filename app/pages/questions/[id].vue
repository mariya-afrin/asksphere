<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <LoadingState v-if="pending" label="Loading question..." />

    <div v-else-if="error" class="card p-6">
      <p class="text-danger text-sm">{{ error.message }}</p>
    </div>

    <template v-else-if="question">
      <!-- Question -->
      <article class="card p-6">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-xl sm:text-2xl font-semibold text-ink leading-snug">
            {{ question.title }}
          </h1>
          <div class="flex gap-2 shrink-0 flex-wrap justify-end">
            <BookmarkButton
              v-if="isAuthenticated"
              :bookmarked="bookmarked"
              :loading="bookmarkLoading"
              @toggle="toggleBookmark"
            />
            <ReportButton
              v-if="isAuthenticated && !isQuestionAuthor"
              target-type="question"
              :target-id="question.id"
            />
            <template v-if="isQuestionAuthor">
              <NuxtLink
                :to="`/questions/${question.id}/edit`"
                class="btn-secondary text-xs"
              >
                Edit
              </NuxtLink>
              <button
                type="button"
                class="btn-danger text-xs"
                @click="confirmOpen = true"
              >
                Delete
              </button>
            </template>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span class="tag">{{ question.category }}</span>
          <span v-for="tag in question.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <div class="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <span>
            Asked by
            <NuxtLink
              :to="`/users/${question.author.username}`"
              class="link"
            >
              {{ question.author.username }}
            </NuxtLink>
            · reputation {{ question.author.reputation }}
          </span>
          <time :datetime="question.createdAt">
            {{ new Date(question.createdAt).toLocaleString() }}
          </time>
        </div>

        <div class="mt-4 text-ink whitespace-pre-wrap text-sm leading-relaxed">
          {{ question.body }}
        </div>

        <div class="mt-6 flex items-center gap-4 text-xs text-ink-muted">
          <span>{{ question.viewCount }} views</span>
          <span>{{ question.answerCount }} answers</span>
          <span>Score: {{ question.voteScore }}</span>
        </div>

        <!-- Question comments -->
        <div class="mt-4 border-t border-surface-border pt-3 space-y-2">
          <CommentList
            :comments="questionComments"
            :current-user-id="user?.id ?? null"
            :is-admin="user?.role === 'admin'"
            @update="updateQuestionComment"
            @delete="deleteQuestionComment"
          />
          <CommentForm
            v-if="isAuthenticated"
            :can-comment="true"
            @submit="createQuestionComment"
          />
        </div>
      </article>

      <!-- Answer form -->
      <section v-if="isAuthenticated" class="space-y-3">
        <AnswerForm v-if="!editingAnswerId" @submit="submitAnswer" />
        <AnswerForm
          v-else
          editing
          :initial-body="editingAnswerBody"
          @submit="saveEditedAnswer"
          @cancel="cancelEdit"
        />
      </section>

      <div v-else class="card p-5 text-sm text-ink-muted">
        <NuxtLink to="/login" class="link">Log in</NuxtLink> to answer this question.
      </div>

      <!-- Answers list -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-ink">
          {{ answers.length }} {{ answers.length === 1 ? 'Answer' : 'Answers' }}
        </h2>

        <LoadingState v-if="answersPending" label="Loading answers..." />

        <AnswerCard
          v-for="a in answers"
          v-else
          :key="a.id"
          :answer="a"
          :current-user-id="user?.id ?? null"
          :question-author-id="question.author.id"
          :is-admin="user?.role === 'admin'"
          @accept="onAccept"
          @edit="startEdit"
          @delete="onDeleteAnswer"
          @vote="onVote"
          @comment-create="createAnswerComment"
          @comment-update="updateAnswerComment"
          @comment-delete="deleteAnswerComment"
        />

        <EmptyState
          v-if="!answersPending && answers.length === 0"
          title="No answers yet"
          description="Be the first to help by answering this question."
        />
      </section>
    </template>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete this question?"
      description="This will remove the question and its answers from the public site."
      confirm-text="Delete"
      @confirm="onDeleteQuestion"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface CommentItem {
  id: string
  body: string
  createdAt: string
  author: { id: string | null; username: string }
}

interface QuestionDetail {
  id: string
  title: string
  body: string
  category: string
  tags: string[]
  answerCount: number
  viewCount: number
  voteScore: number
  status: string
  createdAt: string
  author: {
    id: string | null
    username: string
    avatarUrl: string
    reputation: number
  }
}

interface AnswerItem {
  id: string
  body: string
  voteScore: number
  myVote: number
  isAccepted: boolean
  createdAt: string
  updatedAt: string
  comments: CommentItem[]
  author: {
    id: string | null
    username: string
    avatarUrl: string
    reputation: number
  }
}

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const id = route.params.id as string

const confirmOpen = ref(false)

const { data, pending, error } = await useFetch<{
  success: boolean
  data: QuestionDetail
}>(`/api/questions/${id}`)
const question = computed(() => data.value?.data ?? null)

const {
  data: answersData,
  pending: answersPending,
  refresh: refreshAnswers
} = await useFetch<{ success: boolean; data: { items: AnswerItem[] } }>(
  `/api/questions/${id}/answers-with-comments`
)
const answers = computed<AnswerItem[]>(() => answersData.value?.data?.items ?? [])

const { data: qComments, refresh: refreshQuestionComments } = await useFetch<{
  success: boolean
  data: { items: CommentItem[] }
}>(`/api/questions/${id}/comments`)
const questionComments = computed<CommentItem[]>(
  () => qComments.value?.data?.items ?? []
)

// Bookmark state
const bookmarked = ref(false)
const bookmarkLoading = ref(false)

const { data: bookmarksData } = await useFetch<{
  success: boolean
  data: { items: { id: string }[] }
}>('/api/bookmarks', { server: false, immediate: isAuthenticated.value })

watchEffect(() => {
  if (!isAuthenticated.value) {
    bookmarked.value = false
    return
  }
  const list = bookmarksData.value?.data?.items ?? []
  bookmarked.value = list.some((q) => q.id === id)
})

async function toggleBookmark() {
  bookmarkLoading.value = true
  try {
    if (bookmarked.value) {
      await $fetch(`/api/questions/${id}/bookmark`, { method: 'DELETE' })
      bookmarked.value = false
    } else {
      await $fetch(`/api/questions/${id}/bookmark`, { method: 'PUT' })
      bookmarked.value = true
    }
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update bookmark.')
  } finally {
    bookmarkLoading.value = false
  }
}

const isQuestionAuthor = computed(() => {
  if (!user.value || !question.value) return false
  return (
    question.value.author.id === user.value.id ||
    user.value.role === 'admin'
  )
})

useHead(() => ({ title: question.value?.title ?? 'Question' }))

// ---------- Question comments ----------
async function createQuestionComment(body: string) {
  try {
    await $fetch(`/api/questions/${id}/comments`, {
      method: 'POST',
      body: { body }
    })
    await refreshQuestionComments()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not post comment.')
  }
}

async function updateQuestionComment({ id: cid, body }: { id: string; body: string }) {
  try {
    await $fetch(`/api/comments/${cid}`, { method: 'PATCH', body: { body } })
    await refreshQuestionComments()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update comment.')
  }
}

async function deleteQuestionComment(cid: string) {
  if (!confirm('Delete this comment?')) return
  try {
    await $fetch(`/api/comments/${cid}`, { method: 'DELETE' })
    await refreshQuestionComments()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not delete comment.')
  }
}

// ---------- Answer comments ----------
async function createAnswerComment({
  answerId,
  body
}: {
  answerId: string
  body: string
}) {
  try {
    await $fetch(`/api/answers/${answerId}/comments`, {
      method: 'POST',
      body: { body }
    })
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not post comment.')
  }
}

async function updateAnswerComment({ id: cid, body }: { id: string; body: string }) {
  try {
    await $fetch(`/api/comments/${cid}`, { method: 'PATCH', body: { body } })
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update comment.')
  }
}

async function deleteAnswerComment(cid: string) {
  if (!confirm('Delete this comment?')) return
  try {
    await $fetch(`/api/comments/${cid}`, { method: 'DELETE' })
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not delete comment.')
  }
}

// ---------- Answers ----------
async function submitAnswer(body: string) {
  try {
    await $fetch(`/api/questions/${id}/answers`, {
      method: 'POST',
      body: { body }
    })
    await refreshAnswers()
    await refreshNuxtData(`/api/questions/${id}`)
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not post the answer.')
  }
}

const editingAnswerId = ref<string | null>(null)
const editingAnswerBody = ref('')

function startEdit(answerId: string) {
  const a = answers.value.find((x) => x.id === answerId)
  if (!a) return
  editingAnswerId.value = answerId
  editingAnswerBody.value = a.body
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingAnswerId.value = null
  editingAnswerBody.value = ''
}

async function saveEditedAnswer(body: string) {
  if (!editingAnswerId.value) return
  try {
    await $fetch(`/api/answers/${editingAnswerId.value}`, {
      method: 'PATCH',
      body: { body }
    })
    cancelEdit()
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not save.')
  }
}

async function onDeleteAnswer(answerId: string) {
  if (!confirm('Delete this answer?')) return
  try {
    await $fetch(`/api/answers/${answerId}`, { method: 'DELETE' })
    await refreshAnswers()
    await refreshNuxtData(`/api/questions/${id}`)
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Delete failed.')
  }
}

async function onAccept(answerId: string) {
  try {
    await $fetch(`/api/questions/${id}/accept-answer`, {
      method: 'POST',
      body: { answerId }
    })
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not accept the answer.')
  }
}

async function onVote({ id: answerId, value }: { id: string; value: 1 | -1 }) {
  if (!isAuthenticated.value) {
    router.push(`/login?next=/questions/${id}`)
    return
  }
  const answer = answers.value.find((x) => x.id === answerId)
  if (!answer) return

  try {
    if (answer.myVote === value) {
      await $fetch(`/api/answers/${answerId}/vote`, { method: 'DELETE' })
    } else {
      await $fetch(`/api/answers/${answerId}/vote`, {
        method: 'PUT',
        body: { value }
      })
    }
    await refreshAnswers()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not vote.')
  }
}

async function onDeleteQuestion() {
  confirmOpen.value = false
  try {
    await $fetch(`/api/questions/${id}`, { method: 'DELETE' })
    router.push('/')
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Delete failed.')
  }
}
</script>