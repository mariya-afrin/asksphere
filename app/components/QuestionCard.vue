<!-- app/components/QuestionCard.vue
 * Displays a preview of one question in a list.
 * Props are a subset of the Question model.
 -->
<template>
  <article class="card p-4 sm:p-5 hover:border-primary/50 hover:shadow-md transition-all duration-150">
    <div class="flex items-start gap-4 sm:gap-5">
      <!-- Stats column (Desktop / Tablet) -->
      <div class="hidden sm:flex flex-col items-center gap-2 text-xs shrink-0 w-16">
        <!-- Vote Score -->
        <div class="flex flex-col items-center justify-center w-full py-1 text-center">
          <span class="text-sm font-bold text-ink leading-tight">{{ question.voteScore ?? 0 }}</span>
          <span class="text-[10px] text-ink-muted uppercase tracking-wider">votes</span>
        </div>

        <!-- Answers pill -->
        <div
          class="flex flex-col items-center justify-center w-full py-1.5 px-2 rounded-lg border text-center transition-colors"
          :class="
            question.answerCount > 0
              ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
              : 'border-surface-border text-ink-muted'
          "
        >
          <span class="text-sm font-bold leading-tight">{{ question.answerCount }}</span>
          <span class="text-[10px] uppercase tracking-wider">
            {{ question.answerCount === 1 ? 'answer' : 'answers' }}
          </span>
        </div>

        <!-- Views -->
        <div class="text-[11px] text-ink-muted text-center pt-0.5">
          {{ question.viewCount }} views
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <!-- Mobile-only inline stats -->
        <div class="flex sm:hidden items-center gap-2 text-xs text-ink-muted mb-1.5 flex-wrap">
          <span class="font-medium text-ink">{{ question.voteScore ?? 0 }} votes</span>
          <span>·</span>
          <span
            :class="question.answerCount > 0 ? 'text-primary font-semibold' : ''"
          >
            {{ question.answerCount }} {{ question.answerCount === 1 ? 'answer' : 'answers' }}
          </span>
          <span>·</span>
          <span>{{ question.viewCount }} views</span>
        </div>

        <!-- Title -->
        <h2 class="text-base sm:text-lg font-semibold text-ink leading-snug">
          <NuxtLink
            :to="`/questions/${question.id}`"
            class="hover:text-primary transition-colors"
          >
            {{ question.title }}
          </NuxtLink>
        </h2>

        <!-- Excerpt -->
        <p class="mt-1.5 text-sm text-ink-muted line-clamp-2 leading-relaxed">
          {{ question.excerpt }}
        </p>

        <!-- Category & Tags -->
        <div class="mt-3 flex flex-wrap items-center gap-1.5">
          <span class="tag bg-primary/5 text-primary border-primary/20 font-medium">
            {{ question.category }}
          </span>
          <NuxtLink
            v-for="tag in question.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="tag hover:border-primary/40 transition-colors"
          >
            #{{ tag }}
          </NuxtLink>
        </div>

        <!-- Footer: Author & Timestamp -->
        <div class="mt-3.5 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted gap-2 flex-wrap">
          <div class="flex items-center gap-2 min-w-0">
            <div class="h-5 w-5 rounded-full bg-primary text-white grid place-items-center text-[10px] font-semibold shrink-0 overflow-hidden">
              <img
                v-if="question.author.avatarUrl"
                :src="question.author.avatarUrl"
                :alt="question.author.username"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ question.author.username.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="truncate">
              by
              <NuxtLink
                :to="`/users/${question.author.username}`"
                class="link font-medium text-ink hover:text-primary"
              >
                {{ question.author.username }}
              </NuxtLink>
              <span v-if="question.author.reputation" class="text-ink-muted ml-1">
                ({{ question.author.reputation }})
              </span>
            </span>
          </div>

          <time :datetime="question.createdAt" class="text-ink-muted shrink-0 text-[11px]">
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
  voteScore?: number
  createdAt: string
  author: {
    username: string
    avatarUrl?: string
    reputation?: number
  }
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