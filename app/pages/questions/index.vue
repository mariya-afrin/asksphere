<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-ink">All questions</h1>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium border"
          :class="
            sort === tab.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-ink-muted border-surface-border hover:bg-surface'
          "
          @click="setSort(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <LoadingState v-if="pending" label="Loading questions..." />

    <template v-else-if="items.length">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
      <Pagination
        :page="page"
        :total-pages="totalPages"
        @change="setPage"
      />
    </template>

    <EmptyState
      v-else
      title="No questions found"
      description="Try a different filter or ask the first question."
    >
      <template #action>
        <NuxtLink to="/ask" class="btn-primary">Ask a question</NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'Questions' })

type SortValue = 'latest' | 'popular' | 'unanswered'

const route = useRoute()
const router = useRouter()

const tabs: { value: SortValue; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'unanswered', label: 'Unanswered' }
]

const sort = computed<SortValue>(() => (route.query.sort as SortValue) || 'latest')
const page = computed(() => Number(route.query.page ?? 1) || 1)

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: QuestionCardData[]; totalPages: number }
}>('/api/questions', {
  query: computed(() => ({ sort: sort.value, page: page.value, limit: 10 }))
})

const items = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
const totalPages = computed(() => data.value?.data?.totalPages ?? 1)

function setSort(v: SortValue) {
  router.push({ query: { ...route.query, sort: v, page: 1 } })
}

function setPage(p: number) {
  router.push({ query: { ...route.query, page: p } })
}
</script>