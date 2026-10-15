<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">
      Category: <span class="text-primary">{{ categoryName || slug }}</span>
    </h1>

    <LoadingState v-if="pending" label="Loading questions..." />

    <template v-else-if="items.length">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
      <Pagination :page="page" :total-pages="totalPages" @change="setPage" />
    </template>

    <EmptyState
      v-else
      title="No questions yet"
      description="This category has no open questions."
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

const slug = computed(() => route.params.slug as string)
const page = computed(() => Number(route.query.page ?? 1) || 1)

// Map slug back to the human name.
const slugToName: Record<string, string> = {
  'technology': 'Technology',
  'programming': 'Programming',
  'science': 'Science',
  'mathematics': 'Mathematics',
  'education': 'Education',
  'career': 'Career',
  'business': 'Business',
  'health-and-wellness': 'Health and Wellness',
  'lifestyle': 'Lifestyle',
  'general-knowledge': 'General Knowledge',
  'other': 'Other'
}

const categoryName = computed(() => slugToName[slug.value] || '')

useHead(() => ({ title: categoryName.value || 'Category' }))

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: QuestionCardData[]; totalPages: number }
}>('/api/questions', {
  query: computed(() => ({
    category: categoryName.value,
    page: page.value,
    limit: 10
  }))
})

const items = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
const totalPages = computed(() => data.value?.data?.totalPages ?? 1)

function setPage(p: number) {
  router.push({ query: { ...route.query, page: p } })
}
</script>