<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
    <button
      type="button"
      class="btn-secondary text-xs"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      Previous
    </button>
    <span class="text-sm text-ink-muted">
      Page {{ page }} of {{ totalPages }}
    </span>
    <button
      type="button"
      class="btn-secondary text-xs"
      :disabled="page >= totalPages"
      @click="$emit('change', page + 1)"
    >
      Next
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>()
defineEmits<{ change: [page: number] }>()
</script>