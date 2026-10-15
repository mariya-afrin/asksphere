<!-- app/components/EmptyState.vue
 * Friendly placeholder shown when a list has no items.
 -->
<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="h-12 w-12 rounded-full bg-surface grid place-items-center mb-3">
      <Inbox class="h-6 w-6 text-ink-muted" />
    </div>
    <h3 class="text-base font-semibold text-ink">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-ink-muted max-w-sm">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
}>()
</script>