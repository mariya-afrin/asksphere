<template>
  <div class="space-y-6">
    <section class="glass-card tint-lilac rounded-3xl p-6 sm:p-8">
      <p class="text-xs font-bold uppercase tracking-[.16em] text-primary">Knowledge spaces</p>
      <h1 class="mt-1 text-2xl font-bold text-ink">Browse by category</h1>
      <p class="mt-2 text-sm text-ink-muted">Find conversations in the subjects you care about.</p>
    </section>

    <LoadingState v-if="pending" label="Loading categories..." />

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(c, index) in items"
        :key="c.slug"
        :to="`/categories/${c.slug}`"
        :class="['card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all', categoryTints[index % categoryTints.length]]"
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
const categoryTints = ['tint-sky', 'tint-amber', 'tint-lilac', 'tint-rose', 'tint-mint', 'tint-navy']
</script>
