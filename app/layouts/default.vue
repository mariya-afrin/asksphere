<!-- app/layouts/default.vue
 * Default layout for the public site.
 * Provides the header, main content slot, and footer.
 -->
<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <AppHeader />

    <main class="flex-1">
      <div class="container-page py-6">
        <slot />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// No logic — just composition.
</script>