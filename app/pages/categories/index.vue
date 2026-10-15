<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-ink">Browse by category</h1>

    <LoadingState v-if="pending" label="Loading categories..." />

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="c in items"
        :key="c.slug"
        :to="`/categories/${c.slug}`"
        class="card p-4 hover:border-primary/40 transition-colors"
      >
        <div class="font-medium text-ink">{{ c.name }}</div>
        <div class="text-xs text-ink-muted mt-1">{{ c.count }} questions</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

useHead({ title: 'Categories' })

const { data, pending } = await useFetch<{
  success: boolean
  data: { items: { name: string; slug: string; count: number }[] }
}>('/api/categories')

const items = computed(() => data.value?.data?.items ?? [])
</script>