<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">Tags</h1>

    <LoadingState v-if="pending" label="Loading tags..." />

    <div v-else class="card p-4 flex flex-wrap gap-2">
      <NuxtLink
        v-for="t in items"
        :key="t.tag"
        :to="`/tags/${t.tag}`"
        class="tag hover:bg-primary hover:text-white transition-colors"
      >
        #{{ t.tag }}
        <span class="ml-1 opacity-70">{{ t.count }}</span>
      </NuxtLink>
    </div>

    <EmptyState
      v-if="!pending && items.length === 0"
      title="No tags yet"
      description="Tags will appear once questions are posted with them."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

useHead({ title: 'Tags' })

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: { tag: string; count: number }[] }
}>('/api/tags')

const items = computed(() => data.value?.data?.items ?? [])
</script>