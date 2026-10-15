<!-- app/pages/index.vue
 * Homepage. Shows hero, filters, and a list of questions.
 * Uses TEMPORARY SAMPLE DATA for now. In Phase 4 this is replaced
 * with real data from GET /api/questions.
 -->
<template>
  <div class="space-y-8">
    <!-- Hero -->
    <section class="card p-6 sm:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-ink">
        Ask. Share. Learn Together.
      </h1>
      <p class="mt-2 text-ink-muted max-w-2xl">
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
        class="rounded-lg px-3 py-1.5 text-sm font-medium border"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-ink-muted border-surface-border hover:bg-surface'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </section>

    <!-- Question list -->
    <section class="space-y-3">
      <template v-if="!loading && visibleQuestions.length">
        <QuestionCard
          v-for="q in visibleQuestions"
          :key="q.id"
          :question="q"
        />
      </template>

      <LoadingState v-else-if="loading" label="Loading questions..." />

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
import { ref, computed, onMounted } from 'vue'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'Home' })

type TabValue = 'latest' | 'popular' | 'unanswered'

const tabs: { value: TabValue; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'unanswered', label: 'Unanswered' }
]

const activeTab = ref<TabValue>('latest')
const loading = ref(true)

// TEMPORARY SAMPLE DATA — will be replaced in Phase 4.
const sampleQuestions: (QuestionCardData & { _popular: number })[] = [
  {
    id: 'sample-1',
    title: 'How do I start learning web development in 2026?',
    excerpt:
      'I want to become a web developer but there are so many tutorials. Where should a complete beginner actually start?',
    category: 'Programming',
    tags: ['javascript', 'beginners', 'career'],
    answerCount: 4,
    viewCount: 312,
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    author: { username: 'aya_k' },
    _popular: 90
  },
  {
    id: 'sample-2',
    title: 'Why does my MongoDB query return an empty array?',
    excerpt:
      'I am using Mongoose and my find() call always returns []. The data exists in Atlas. What am I missing?',
    category: 'Programming',
    tags: ['mongodb', 'mongoose'],
    answerCount: 2,
    viewCount: 128,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    author: { username: 'dev_tariq' },
    _popular: 60
  },
  {
    id: 'sample-3',
    title: 'Best way to memorise biology terms before an exam?',
    excerpt:
      'I have a biology exam in two weeks and hundreds of terms to learn. Any study techniques that actually work?',
    category: 'Education',
    tags: ['study-tips', 'biology'],
    answerCount: 0,
    viewCount: 74,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    author: { username: 'noor_study' },
    _popular: 20
  },
  {
    id: 'sample-4',
    title: 'Is a career switch into data science realistic at 35?',
    excerpt:
      'I have ten years of experience in finance. Realistically, what is the path to a data science role?',
    category: 'Career',
    tags: ['career-change', 'data-science'],
    answerCount: 6,
    viewCount: 512,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    author: { username: 'rana_f' },
    _popular: 130
  },
  {
    id: 'sample-5',
    title: 'How much water should I actually drink per day?',
    excerpt:
      'I keep hearing different numbers. Is there a real scientific answer, or is 8 glasses a myth?',
    category: 'Health and Wellness',
    tags: ['nutrition', 'hydration'],
    answerCount: 3,
    viewCount: 190,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    author: { username: 'dr_leo' },
    _popular: 55
  }
]

// Simulate a network request so the loading state is visible.
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})

const visibleQuestions = computed<QuestionCardData[]>(() => {
  const list = [...sampleQuestions]
  if (activeTab.value === 'popular') {
    list.sort((a, b) => b._popular - a._popular)
  } else if (activeTab.value === 'unanswered') {
    return list.filter((q) => q.answerCount === 0)
  } else {
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  return list.map(({ _popular, ...rest }) => rest)
})
</script>