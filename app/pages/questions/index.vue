<template>
  <div class="dashboard-page space-y-6 rounded-[2rem] p-2 sm:p-3">
    <section class="glass-card tint-sky flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.7rem] p-5 sm:p-7">
      <div>
        <div class="pill-badge mb-1">
          <BookOpen class="h-3.5 w-3.5 text-primary" />
          <span>Public Knowledge Base</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">Public Questions</h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1">Explore all community questions, solutions, and technical discussions.</p>
      </div>
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="flex items-center gap-1 p-1 rounded-xl border border-white/70 bg-white/40 backdrop-blur-md">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all"
            :class="
              sort === tab.value
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-surface'
            "
            @click="setSort(tab.value)"
          >
            <component :is="tab.icon" class="h-3.5 w-3.5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
        <NuxtLink to="/ask" class="btn-primary text-xs sm:text-sm shrink-0">
          Ask question
        </NuxtLink>
      </div>
    </section>

    <LoadingState v-if="pending" label="Loading questions..." />

    <div v-else-if="items.length" class="space-y-3.5">
      <QuestionCard v-for="q in items" :key="q.id" :question="q" />
      <Pagination
        :page="page"
        :total-pages="totalPages"
        @change="setPage"
      />
    </div>

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
import { BookOpen, Clock, Flame, HelpCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'Questions' })

type SortValue = 'latest' | 'popular' | 'unanswered'

const route = useRoute()
const router = useRouter()

const tabs = [
  { value: 'latest' as SortValue, label: 'Latest', icon: Clock },
  { value: 'popular' as SortValue, label: 'Popular', icon: Flame },
  { value: 'unanswered' as SortValue, label: 'Unanswered', icon: HelpCircle }
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
