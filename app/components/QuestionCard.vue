<!-- app/components/QuestionCard.vue
 * Displays a preview of one question in a list.
 * Props are a subset of the Question model.
 -->
<template>
  <article class="card p-4 hover:border-primary/40 transition-colors">
    <div class="flex gap-4">
      <!-- Stats column -->
      <div class="hidden sm:flex flex-col items-center gap-3 text-xs text-ink-muted min-w-[3rem]">
        <div class="text-center">
          <div class="text-base font-semibold text-ink">{{ question.answerCount }}</div>
          <div>answers</div>
        </div>
        <div class="text-center">
          <div class="text-base font-semibold text-ink">{{ question.viewCount }}</div>
          <div>views</div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-ink leading-snug">
          <NuxtLink
            :to="`/questions/${question.id}`"
            class="hover:text-primary"
          >
            {{ question.title }}
          </NuxtLink>
        </h2>

        <p class="mt-1 text-sm text-ink-muted line-clamp-2">
          {{ question.excerpt }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span class="tag">{{ question.category }}</span>
          <span
            v-for="tag in question.tags"
            :key="tag"
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>
            by
            <NuxtLink
              :to="`/users/${question.author.username}`"
              class="link"
            >
              {{ question.author.username }}
            </NuxtLink>
          </span>
          <time :datetime="question.createdAt">
            {{ relativeTime }}
          </time>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface QuestionCardData {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  answerCount: number
  viewCount: number
  createdAt: string
  author: { username: string }
}

const props = defineProps<{ question: QuestionCardData }>()

const relativeTime = computed(() => formatRelative(props.question.createdAt))

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(1, Math.floor((now - then) / 1000))
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34, 'week'],
    [12, 'month']
  ]
  let value = diffSec
  let unit = 'second'
  for (const [step, name] of units) {
    if (value < step) {
      unit = name
      break
    }
    value = value / step
    unit = name
  }
  const rounded = Math.floor(value)
  return `${rounded} ${unit}${rounded === 1 ? '' : 's'} ago`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>