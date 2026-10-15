<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-ink">Categories</h1>
    <p class="text-sm text-ink-muted">
      Categories are currently a fixed list defined in the application code.
      Managing categories dynamically is a future enhancement.
    </p>

    <div class="card p-4">
      <ul class="text-sm text-ink space-y-1">
        <li v-for="c in categories" :key="c">• {{ c }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin — Categories' })

const categories = [
  'Technology', 'Programming', 'Science', 'Mathematics', 'Education',
  'Career', 'Business', 'Health and Wellness', 'Lifestyle',
  'General Knowledge', 'Other'
]
</script>