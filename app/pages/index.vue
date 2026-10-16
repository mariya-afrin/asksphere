<!-- app/pages/index.vue
 * Homepage. Shows hero, filters, and a list of questions.
 -->
<template>
  <div class="space-y-8">
    <!-- Hero -->
    <section class="card p-6 sm:p-8 bg-white border border-surface-border">
      <h1 class="text-2xl sm:text-3xl font-bold text-ink">
        Ask. Share. Learn Together.
      </h1>
      <p class="mt-2 text-ink-muted max-w-2xl leading-relaxed text-sm sm:text-base">
        AskSphere is a community where anyone can ask questions on any topic
        and get real answers from people who know. Technology, science,
        education, careers, health, and more.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <NuxtLink to="/ask" class="btn-primary">Ask a question</NuxtLink>
        <NuxtLink to="/questions" class="btn-secondary">Browse questions</NuxtLink>
      </div>
    </section>

    <!-- Filters -->
    <section class="flex flex-wrap items-center gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium border transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-white text-ink-muted border-surface-border hover:bg-surface hover:text-ink'
        "
        @click="activeTab = tab.value"
      >
        <component :is="tab.icon" class="h-3.5 w-3.5" />
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <!-- Question feed -->
    <section class="space-y-3.5">
      <template v-if="!pending && visibleQuestions.length">
        <QuestionCard
          v-for="q in visibleQuestions"
          :key="q.id"
          :question="q"
        />
      </template>

      <LoadingState v-else-if="pending" label="Loading questions..." />

      <EmptyState
        v-else
        title="No questions yet"
        description="Be the first to ask something on AskSphere."
      >
        <template #action>
          <NuxtLink to="/ask" class="btn-primary">Ask the first question</NuxtLink>
        </template>
      </EmptyState>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Clock, Flame, HelpCircle } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'Home' })

type TabValue = 'latest' | 'popular' | 'unanswered'

const tabs = [
  { value: 'latest' as TabValue, label: 'Latest', icon: Clock },
  { value: 'popular' as TabValue, label: 'Popular', icon: Flame },
  { value: 'unanswered' as TabValue, label: 'Unanswered', icon: HelpCircle }
]

const activeTab = ref<TabValue>('latest')

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: QuestionCardData[]; totalPages: number }
}>('/api/questions', {
  query: computed(() => ({
    sort: activeTab.value,
    page: 1,
    limit: 20
  }))
})

const visibleQuestions = computed<QuestionCardData[]>(
  () => data.value?.data?.items ?? []
)
</script>