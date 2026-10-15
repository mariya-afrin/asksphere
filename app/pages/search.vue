<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">
      Search results
      <span v-if="q" class="text-ink-muted font-normal">for "{{ q }}"</span>
    </h1>

    <form class="flex gap-2" @submit.prevent="onSearch">
      <input
        v-model="localQuery"
        type="search"
        placeholder="Search questions..."
        class="input"
      />
      <button type="submit" class="btn-primary">Search</button>
    </form>

    <LoadingState v-if="pending" label="Searching..." />

    <template v-else-if="items.length">
      <QuestionCard v-for="item in items" :key="item.id" :question="item" />
      <Pagination :page="page" :total-pages="totalPages" @change="setPage" />
    </template>

    <EmptyState
      v-else-if="q"
      title="No results"
      description="No questions matched your search. Try different words."
    />

    <EmptyState
      v-else
      title="Start typing"
      description="Enter keywords above to search questions."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

const route = useRoute()
const router = useRouter()

const q = computed(() => (route.query.q as string) || '')
const page = computed(() => Number(route.query.page ?? 1) || 1)
const localQuery = ref(q.value)

watch(q, (v) => { localQuery.value = v })

useHead(() => ({ title: q.value ? `Search: ${q.value}` : 'Search' }))

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: QuestionCardData[]; totalPages: number }
}>('/api/questions', {
  query: computed(() => ({ search: q.value, page: page.value, limit: 10 }))
})

const items = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
const totalPages = computed(() => data.value?.data?.totalPages ?? 1)

function onSearch() {
  const value = localQuery.value.trim()
  router.push({ query: value ? { q: value } : {} })
}

function setPage(p: number) {
  router.push({ query: { ...route.query, page: p } })
}
</script>