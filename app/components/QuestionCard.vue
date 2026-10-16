<!-- app/components/QuestionCard.vue
 * Displays a clean, modern, user-friendly feed card for a question.
 * Props are a subset of the Question model.
 -->
<template>
  <article class="card p-4 sm:p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200 group bg-white">
    <!-- Post Header: Author, relative time, Category pill -->
    <div class="flex items-center justify-between gap-3 mb-2.5">
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Author Avatar -->
        <NuxtLink :to="`/users/${question.author.username}`" class="shrink-0" :aria-label="question.author.username">
          <div class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs grid place-items-center overflow-hidden border border-surface-border">
            <img
              v-if="question.author.avatarUrl"
              :src="question.author.avatarUrl"
              :alt="question.author.username"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ question.author.username.charAt(0).toUpperCase() }}</span>
          </div>
        </NuxtLink>

        <!-- Author details -->
        <div class="flex items-center gap-1.5 text-xs text-ink-muted truncate">
          <NuxtLink
            :to="`/users/${question.author.username}`"
            class="font-semibold text-ink hover:text-primary transition-colors truncate"
          >
            {{ question.author.username }}
          </NuxtLink>
          <span
            v-if="question.author.reputation !== undefined"
            class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-surface text-ink-muted border border-surface-border shrink-0"
            title="Reputation"
          >
            {{ question.author.reputation }} rep
          </span>
          <span class="text-ink-muted/60">·</span>
          <time :datetime="question.createdAt" class="text-ink-muted shrink-0 text-xs">
            {{ relativeTime }}
          </time>
        </div>
      </div>

      <!-- Category Pill -->
      <NuxtLink
        :to="`/categories/${question.category.toLowerCase()}`"
        class="tag text-xs font-medium bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors shrink-0"
      >
        {{ question.category }}
      </NuxtLink>
    </div>

    <!-- Question Title -->
    <h2 class="text-base sm:text-lg font-bold text-ink leading-snug tracking-tight">
      <NuxtLink
        :to="`/questions/${question.id}`"
        class="group-hover:text-primary transition-colors line-clamp-2"
      >
        {{ question.title }}
      </NuxtLink>
    </h2>

    <!-- Question Excerpt -->
    <p v-if="question.excerpt" class="mt-1.5 text-sm text-ink-muted leading-relaxed line-clamp-2">
      {{ question.excerpt }}
    </p>

    <!-- Tags -->
    <div v-if="question.tags?.length" class="mt-3 flex flex-wrap items-center gap-1.5">
      <NuxtLink
        v-for="tag in question.tags"
        :key="tag"
        :to="`/tags/${tag}`"
        class="tag text-xs py-0.5 px-2 hover:border-primary/40 hover:text-primary transition-colors"
      >
        #{{ tag }}
      </NuxtLink>
    </div>

    <!-- Bottom Engagement Bar: Votes, Answers, Views -->
    <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <!-- Votes Pill -->
        <div
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors"
          :class="
            (question.voteScore ?? 0) > 0
              ? 'border-primary/30 bg-primary/5 text-primary'
              : (question.voteScore ?? 0) < 0
                ? 'border-danger/30 bg-danger/5 text-danger'
                : 'border-surface-border bg-surface/50 text-ink-muted'
          "
        >
          <ChevronUp class="h-3.5 w-3.5" />
          <span>{{ question.voteScore ?? 0 }} {{ Math.abs(question.voteScore ?? 0) === 1 ? 'vote' : 'votes' }}</span>
        </div>

        <!-- Answers Pill -->
        <NuxtLink
          :to="`/questions/${question.id}#answers`"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors"
          :class="
            question.answerCount > 0
              ? 'border-primary/40 bg-primary/10 text-primary font-semibold hover:bg-primary/15'
              : 'border-surface-border bg-surface/50 text-ink-muted hover:bg-surface'
          "
        >
          <MessageSquare class="h-3.5 w-3.5" />
          <span>{{ question.answerCount }} {{ question.answerCount === 1 ? 'answer' : 'answers' }}</span>
        </NuxtLink>
      </div>

      <!-- Views Counter -->
      <div class="flex items-center gap-1.5 text-ink-muted text-xs">
        <Eye class="h-3.5 w-3.5" />
        <span>{{ question.viewCount }} views</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ChevronUp, MessageSquare, Eye } from 'lucide-vue-next'
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