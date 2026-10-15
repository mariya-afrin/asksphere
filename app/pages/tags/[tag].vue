<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">
      Tag: <span class="text-primary">#{{ tag }}</span>
    </h1>

    <LoadingState v-if="pending" label="Loading questions..." />

    <template v-else-if="items.length">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
      <Pagination :page="page" :total-pages="totalPages" @change="setPage" />
    </template>

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

const tag = computed(() => route.params.tag as string)
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