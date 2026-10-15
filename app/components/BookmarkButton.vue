<template>
  <button
    type="button"
    class="btn-secondary text-xs gap-1"
    :disabled="disabled || loading"
    :aria-pressed="bookmarked"
    @click="$emit('toggle')"
  >
    <BookmarkIcon class="h-4 w-4" :class="bookmarked ? 'fill-current text-primary' : ''" />
    {{ bookmarked ? 'Saved' : 'Save' }}
  </button>
</template>

<script setup lang="ts">
import { Bookmark as BookmarkIcon } from 'lucide-vue-next'

defineProps<{
  bookmarked: boolean
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{ toggle: [] }>()
</script>