<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <AppHeader />
    <div class="container-page py-6 grid gap-6 md:grid-cols-[200px_1fr]">
      <aside class="card p-3 h-fit">
        <h2 class="text-xs uppercase text-ink-muted px-2 mb-2">Admin</h2>
        <nav class="flex md:flex-col gap-2">
          <NuxtLink to="/admin" class="rounded px-3 py-2 text-sm hover:bg-surface">Dashboard</NuxtLink>
          <NuxtLink to="/admin/reports" class="rounded px-3 py-2 text-sm hover:bg-surface">Reports</NuxtLink>
          <NuxtLink to="/admin/users" class="rounded px-3 py-2 text-sm hover:bg-surface">Users</NuxtLink>
          <NuxtLink to="/admin/categories" class="rounded px-3 py-2 text-sm hover:bg-surface">Categories</NuxtLink>
        </nav>
      </aside>
      <main class="min-w-0">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Uses AppHeader and AppFooter from the global components.
</script>