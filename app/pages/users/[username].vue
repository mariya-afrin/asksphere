<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <LoadingState v-if="pending" label="Loading profile..." />

    <template v-else-if="profile">
      <header class="card p-6 flex items-start gap-4">
        <div class="h-16 w-16 rounded-full bg-primary text-white grid place-items-center text-xl font-semibold shrink-0 overflow-hidden">
          <img
            v-if="profile.user.avatarUrl"
            :src="profile.user.avatarUrl"
            :alt="profile.user.username"
            class="h-full w-full object-cover"
          />
          <span v-else>{{ profile.user.username.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h1 class="text-lg font-semibold text-ink">{{ profile.user.username }}</h1>
            <NuxtLink
              v-if="isCurrentUser"
              to="/settings/profile"
              class="btn-secondary text-xs"
            >
              Edit profile
            </NuxtLink>
          </div>
          <p v-if="profile.user.bio" class="text-sm text-ink-muted mt-1 whitespace-pre-wrap">{{ profile.user.bio }}</p>
          <div class="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
            <span><b class="text-ink">{{ profile.user.reputation }}</b> reputation</span>
            <span><b class="text-ink">{{ profile.user.questionCount }}</b> questions</span>
            <span><b class="text-ink">{{ profile.user.answerCount }}</b> answers</span>
            <span><b class="text-ink">{{ profile.user.acceptedAnswerCount }}</b> accepted</span>
            <span>Joined {{ new Date(profile.user.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </header>

      <section>
        <h2 class="text-base font-semibold text-ink mb-3">Questions</h2>
        <div v-if="profile.questions.length" class="space-y-2">
          <NuxtLink
            v-for="q in profile.questions"
            :key="q.id"
            :to="`/questions/${q.id}`"
            class="card p-3 block hover:border-primary/40 transition-colors"
          >
            <div class="text-sm font-medium text-ink">{{ q.title }}</div>
            <div class="text-xs text-ink-muted mt-1">
              {{ q.category }} · {{ q.answerCount }} answers · score {{ q.voteScore }}
            </div>
          </NuxtLink>
        </div>
        <EmptyState v-else title="No questions yet" />
      </section>

      <section>
        <h2 class="text-base font-semibold text-ink mb-3">Answers</h2>
        <div v-if="profile.answers.length" class="space-y-2">
          <NuxtLink
            v-for="a in profile.answers"
            :key="a.id"
            :to="`/questions/${a.questionId}`"
            class="card p-3 block hover:border-primary/40 transition-colors"
          >
            <div class="text-xs text-ink-muted mb-1">On: {{ a.questionTitle }}</div>
            <div class="text-sm text-ink line-clamp-2">{{ a.body }}</div>
            <div class="text-xs text-ink-muted mt-1">score {{ a.voteScore }}</div>
          </NuxtLink>
        </div>
        <EmptyState v-else title="No answers yet" />
      </section>
    </template>

    <EmptyState
      v-else
      title="User not found"
      description="The user you are looking for does not exist."
    >
      <template #action>
        <NuxtLink to="/" class="btn-primary">Back to home</NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { user } = useAuth()
const username = computed(() => route.params.username as string)

interface Profile {
  user: {
    id: string
    username: string
    bio: string
    avatarUrl?: string
    reputation: number
    questionCount: number
    answerCount: number
    acceptedAnswerCount: number
    createdAt: string
  }
  questions: { id: string; title: string; category: string; answerCount: number; voteScore: number; createdAt: string }[]
  answers: { id: string; body: string; voteScore: number; questionId: string | null; questionTitle: string; createdAt: string }[]
}

const { data, pending, error } = await useFetch<{ success: boolean; data: Profile }>(
  () => `/api/users/${username.value}`
)

const profile = computed(() => data.value?.data ?? null)
const isCurrentUser = computed(
  () => user.value?.username && user.value.username === profile.value?.user.username
)

useHead(() => ({
  title: profile.value?.user.username ?? 'Profile'
}))
</script>