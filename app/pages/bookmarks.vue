<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-xl font-semibold text-ink">Your bookmarks</h1>

    <LoadingState v-if="pending" label="Loading bookmarks..." />

    <template v-else-if="items.length">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
    </template>

    <EmptyState
      v-else
      title="No bookmarks yet"
      description="Save interesting questions and they will show up here."
    >
      <template #action>
        <NuxtLink to="/" class="btn-primary">Browse questions</NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'Bookmarks' })

const { isAuthenticated } = useAuth()

if (!isAuthenticated.value) {
  await navigateTo('/login?next=/bookmarks')
}

const { data, pending } = await useFetch<{ success: boolean; data: { items: QuestionCardData[] } }>(
  '/api/bookmarks'
)

const items = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
</script>