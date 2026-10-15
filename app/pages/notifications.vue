<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-ink">Notifications</h1>
      <button
        v-if="items.some((n) => !n.read)"
        type="button"
        class="btn-secondary text-xs"
        @click="markAll"
      >
        Mark all as read
      </button>
    </div>

    <LoadingState v-if="pending" label="Loading notifications..." />

    <div v-else-if="items.length" class="card divide-y divide-surface-border">
      <div
        v-for="n in items"
        :key="n.id"
        class="p-4 flex items-start gap-3"
        :class="n.read ? 'opacity-70' : ''"
      >
        <div class="h-2 w-2 mt-2 rounded-full shrink-0" :class="n.read ? 'bg-surface-border' : 'bg-primary'" />
        <div class="flex-1">
          <div class="text-sm text-ink">{{ n.message }}</div>
          <div class="text-xs text-ink-muted mt-1">{{ new Date(n.createdAt).toLocaleString() }}</div>
        </div>
        <div class="flex gap-2 shrink-0">
          <NuxtLink v-if="n.questionId" :to="`/questions/${n.questionId}`" class="btn-secondary text-xs">Open</NuxtLink>
          <button v-if="!n.read" type="button" class="btn-secondary text-xs" @click="markOne(n.id)">Mark read</button>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      title="No notifications"
      description="You will see notifications here when someone interacts with your content."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

useHead({ title: 'Notifications' })

const { isAuthenticated } = useAuth()
if (!isAuthenticated.value) {
  await navigateTo('/login?next=/notifications')
}

const { data, pending, refresh } = await useFetch<{
  success: boolean
  data: {
    items: {
      id: string
      type: string
      message: string
      questionId: string | null
      answerId: string | null
      read: boolean
      createdAt: string
      actor: { id: string | null; username: string }
    }[]
    unreadCount: number
  }
}>('/api/notifications')

const items = computed(() => data.value?.data?.items ?? [])

async function markOne(id: string) {
  await $fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
  await refresh()
}

async function markAll() {
  await $fetch('/api/notifications/read-all', { method: 'POST' })
  await refresh()
}
</script>