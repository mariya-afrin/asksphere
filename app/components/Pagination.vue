<template>
  <nav v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 mt-5" aria-label="Pagination">
    <button
      type="button"
      class="btn-secondary text-xs"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      Previous
    </button>
    <button
      v-for="pageNumber in pages"
      :key="pageNumber"
      type="button"
      class="grid h-9 min-w-9 place-items-center rounded-xl px-2 text-xs font-bold transition-colors"
      :class="pageNumber === page ? 'bg-primary text-white shadow-sm' : 'bg-white/70 text-ink-muted hover:bg-primary/10 hover:text-primary'"
      :aria-label="`Go to page ${pageNumber}`"
      :aria-current="pageNumber === page ? 'page' : undefined"
      @click="$emit('change', pageNumber)"
    >
      {{ pageNumber }}
    </button>
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
import { computed } from 'vue'

defineEmits<{ change: [page: number] }>()

const props = defineProps<{ page: number; totalPages: number }>()
const pages = computed(() => {
  const first = Math.max(1, Math.min(props.page - 2, props.totalPages - 4))
  const last = Math.min(props.totalPages, first + 4)
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
})
</script>
