<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between pb-3 border-b border-surface-border">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-ink">
          Tag: <span class="text-primary">#{{ tag }}</span>
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-0.5">
          Questions and discussions tagged with #{{ tag }}
        </p>
      </div>
      <NuxtLink to="/ask" class="btn-primary text-xs sm:text-sm">
        Ask question
      </NuxtLink>
    </div>

    <LoadingState v-if="pending" label="Loading questions..." />

    <div v-else-if="items.length" class="space-y-3.5">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
      <Pagination :page="page" :total-pages="totalPages" @change="setPage" />
    </div>

    <EmptyState
      v-else
      title="No questions with this tag"
      description="Be the first to ask a question using this tag."
    >
      <template #action>
        <NuxtLink to="/ask" class="btn-primary">Ask a question</NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

const route = useRoute()
const router = useRouter()

const tag = computed(() => {
  const t = route.params.tag
  return Array.isArray(t) ? t.join('/') : String(t ?? '')
})
const page = computed(() => Number(route.query.page ?? 1) || 1)

useHead(() => ({ title: `#${tag.value}` }))

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: QuestionCardData[]; totalPages: number }
}>('/api/questions', {
  query: computed(() => ({ tag: tag.value, page: page.value, limit: 10 }))
})

const items = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
const totalPages = computed(() => data.value?.data?.totalPages ?? 1)

function setPage(p: number) {
  router.push({ query: { ...route.query, page: p } })
}
</script>
