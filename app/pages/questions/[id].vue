<template>
  <div class="w-full space-y-6">
    <LoadingState v-if="pending" label="Loading question..." />

    <div v-else-if="error" class="card p-6 max-w-2xl mx-auto">
      <p class="text-danger text-sm">{{ error.message }}</p>
    </div>

    <template v-else-if="question">
      <!-- Breadcrumb navigation -->
      <div class="flex items-center justify-between text-xs text-ink-muted">
        <NuxtLink to="/questions" class="inline-flex items-center gap-1 hover:text-ink font-medium transition-colors">
          ← Back to questions
        </NuxtLink>
        <span class="tag">{{ question.category }}</span>
      </div>

      <!-- Responsive Grid: Side-by-Side on Desktop (lg+), Stacked on Mobile -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        <!-- LEFT COLUMN: Question Details & Discussion (lg:col-span-6 xl:col-span-7) -->
        <div class="lg:col-span-6 xl:col-span-7 space-y-6">
          <article class="card p-6 sm:p-7 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <h1 class="text-xl sm:text-2xl font-bold text-ink leading-snug">
                {{ question.title }}
              </h1>
              <div class="flex items-center gap-2 shrink-0 flex-wrap sm:justify-end">
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

            <!-- Tags -->
            <div v-if="question.tags?.length" class="flex flex-wrap items-center gap-2">
              <span v-for="tag in question.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>

            <!-- Author & Metadata -->
            <div class="flex items-center gap-3 text-xs text-ink-muted pb-4 border-b border-surface-border">
              <div class="h-9 w-9 rounded-full bg-primary text-white grid place-items-center text-xs font-semibold shrink-0 overflow-hidden">
                <img
                  v-if="question.author.avatarUrl"
                  :src="question.author.avatarUrl"
                  :alt="question.author.username"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ question.author.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div>
                  Asked by
                  <NuxtLink
                    :to="`/users/${question.author.username}`"
                    class="link font-medium text-ink"
                  >
                    {{ question.author.username }}
                  </NuxtLink>
                  · reputation {{ question.author.reputation }}
                </div>
                <time :datetime="question.createdAt" class="text-[11px] text-ink-muted">
                  {{ new Date(question.createdAt).toLocaleString() }}
                </time>
              </div>
            </div>

            <!-- Question Body -->
            <div class="text-ink whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {{ question.body }}
            </div>

            <!-- Stats Bar -->
            <div class="flex items-center gap-4 pt-3 border-t border-surface-border text-xs text-ink-muted font-medium">
              <span>{{ question.viewCount }} views</span>
              <span>{{ question.answerCount }} answers</span>
              <span>Score: {{ question.voteScore }}</span>
              <span v-if="question.status !== 'open'" class="capitalize font-semibold text-danger">({{ question.status }})</span>
            </div>

            <!-- Question comments -->
            <div class="border-t border-surface-border pt-4 space-y-3">
              <div class="text-xs font-semibold uppercase tracking-wider text-ink-muted">Comments</div>
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
        </div>

        <!-- RIGHT COLUMN: Answers List & Composer (lg:col-span-6 xl:col-span-5) -->
        <div class="lg:col-span-6 xl:col-span-5 space-y-6">
          
          <!-- Answer composer card -->
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

          <div v-else class="card p-5 text-sm text-ink-muted text-center space-y-2">
            <p>Have an answer to this question?</p>
            <div class="flex justify-center gap-2">
              <NuxtLink to="/login" class="btn-primary text-xs">Log in to answer</NuxtLink>
              <NuxtLink to="/register" class="btn-secondary text-xs">Sign up</NuxtLink>
            </div>
          </div>

          <!-- Answers Section Header & Feed -->
          <section class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-surface-border">
              <h2 class="text-base font-semibold text-ink flex items-center gap-2">
                <span>{{ answers.length }} {{ answers.length === 1 ? 'Answer' : 'Answers' }}</span>
                <span
                  v-if="question.acceptedAnswerId"
                  class="tag text-success border-success/40 bg-success/5 text-[11px]"
                >
                  ✓ Solved
                </span>
              </h2>
            </div>

            <LoadingState v-if="answersPending" label="Loading answers..." />

            <template v-else-if="answers.length">
              <AnswerCard
                v-for="a in answers"
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
            </template>

            <EmptyState
              v-else-if="!answersPending && answers.length === 0"
              title="No answers yet"
              description="Be the first to help by answering this question above."
            />
          </section>
        </div>

      </div>
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