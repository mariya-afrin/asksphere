<!-- app/components/LoadingState.vue
 * A centered spinner with an optional label. Reused wherever
 * we wait for data.
 -->
<template>
  <div class="flex flex-col items-center justify-center py-12 text-ink-muted">
    <div
      class="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-primary"
      role="status"
      aria-label="Loading"
    />
    <p v-if="label" class="mt-3 text-sm">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
</script>