<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">Admin dashboard</h1>

    <LoadingState v-if="pending" label="Loading stats..." />

    <div v-else-if="stats" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div class="card p-4">
        <div class="text-2xl font-semibold text-ink">{{ stats.userCount }}</div>
        <div class="text-xs text-ink-muted">Total users</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-semibold text-ink">{{ stats.suspendedCount }}</div>
        <div class="text-xs text-ink-muted">Suspended</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-semibold text-ink">{{ stats.questionCount }}</div>
        <div class="text-xs text-ink-muted">Questions</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-semibold text-ink">{{ stats.answerCount }}</div>
        <div class="text-xs text-ink-muted">Answers</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-semibold text-danger">{{ stats.pendingReports }}</div>
        <div class="text-xs text-ink-muted">Pending reports</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin' })

const { data, pending } = await useFetch<{
  success: boolean
  data: {
    userCount: number
    suspendedCount: number
    questionCount: number
    answerCount: number
    pendingReports: number
  }
}>('/api/admin/stats')

const stats = computed(() => data.value?.data ?? null)
</script>