<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">Leaderboard</h1>
    <p class="text-sm text-ink-muted">Top contributors by reputation.</p>

    <LoadingState v-if="pending" label="Loading leaderboard..." />

    <div v-else class="card divide-y divide-surface-border">
      <div
        v-for="(u, i) in items"
        :key="u.id"
        class="flex items-center gap-4 p-4"
      >
        <div class="w-8 text-sm font-semibold text-ink-muted text-center">#{{ i + 1 }}</div>
        <div class="h-9 w-9 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold">
          {{ u.username.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <NuxtLink :to="`/users/${u.username}`" class="link font-medium">{{ u.username }}</NuxtLink>
          <div class="text-xs text-ink-muted">
            {{ u.questionCount }} questions · {{ u.answerCount }} answers · {{ u.acceptedAnswerCount }} accepted
          </div>
        </div>
        <div class="text-right">
          <div class="text-base font-semibold text-primary">{{ u.reputation }}</div>
          <div class="text-xs text-ink-muted">reputation</div>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="!pending && items.length === 0"
      title="No users yet"
      description="The leaderboard will appear once users start contributing."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

useHead({ title: 'Leaderboard' })

interface LeaderUser {
  id: string
  username: string
  reputation: number
  questionCount: number
  answerCount: number
  acceptedAnswerCount: number
}

const { data, pending } = await useFetch<{ success: boolean; data: { items: LeaderUser[] } }>(
  '/api/leaderboard'
)

const items = computed<LeaderUser[]>(() => data.value?.data?.items ?? [])
</script>