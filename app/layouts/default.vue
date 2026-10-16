<!-- app/layouts/default.vue
 * Default layout for the public site.
 * Provides the header, main content slot, and footer.
 -->
<template>
  <!-- The entry page is deliberately a self-contained experience. The product
       shell starts once a visitor enters the community or signs in. -->
  <div v-if="isLanding" class="min-h-screen">
    <slot />
  </div>

  <div v-else class="relative min-h-screen flex flex-col">
    <AppHeader />
    <main class="relative z-[1] flex-1"><div class="container-page py-6"><slot /></div></main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isAuthenticated } = useAuth()
const isLanding = computed(() => route.path === '/' && !isAuthenticated.value)
</script>
