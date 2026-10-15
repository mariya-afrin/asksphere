<!-- app/app.vue
 * The root Vue component. Every page in the application is rendered
 * inside <NuxtLayout><NuxtPage /></NuxtLayout>.
 *
 * Nuxt automatically wraps every page with this component.
 * The <NuxtLayout> component looks for a matching file in app/layouts/.
 * The <NuxtPage> component renders the page file that matches the URL.
 -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Nuxt automatically imports composables like useHead, so we do not
// need explicit imports here. This file has no additional logic yet.
</script>
