<template>
  <div class="flex flex-col items-center gap-1">
    <button
      type="button"
      class="rounded-md p-1 hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
      :class="myVote === 1 ? 'text-primary' : 'text-ink-muted'"
      :disabled="!canVote"
      :aria-label="myVote === 1 ? 'Remove upvote' : 'Upvote'"
      :title="myVote === 1 ? 'Remove upvote' : 'Upvote'"
      @click="$emit('up')"
    >
      <ChevronUp class="h-5 w-5" />
    </button>

    <div class="text-sm font-semibold text-ink">{{ score }}</div>

    <button
      type="button"
      class="rounded-md p-1 hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
      :class="myVote === -1 ? 'text-danger' : 'text-ink-muted'"
      :disabled="!canVote"
      :aria-label="myVote === -1 ? 'Remove downvote' : 'Downvote'"
      :title="myVote === -1 ? 'Remove downvote' : 'Downvote'"
      @click="$emit('down')"
    >
      <ChevronDown class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

defineProps<{
  score: number
  myVote: number
  canVote: boolean
}>()

defineEmits<{ up: []; down: [] }>()
</script>