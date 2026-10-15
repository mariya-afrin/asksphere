<!-- app/components/AppFooter.vue
 * Simple footer with links and copyright.
 -->
<template>
  <footer class="border-t border-surface-border bg-white mt-12">
    <div class="container-page py-8 grid gap-6 sm:grid-cols-3">
      <div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white text-sm font-bold"
          >
            A
          </span>
          <span class="font-semibold text-ink">AskSphere</span>
        </div>
        <p class="mt-2 text-sm text-ink-muted">
          Ask. Share. Learn Together.
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-ink mb-2">Explore</h3>
        <ul class="space-y-1 text-sm">
          <li><NuxtLink to="/questions" class="link">Questions</NuxtLink></li>
          <li><NuxtLink to="/categories" class="link">Categories</NuxtLink></li>
          <li><NuxtLink to="/tags" class="link">Tags</NuxtLink></li>
          <li><NuxtLink to="/leaderboard" class="link">Leaderboard</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-ink mb-2">Account</h3>
        <ul class="space-y-1 text-sm">
          <li><NuxtLink to="/login" class="link">Log in</NuxtLink></li>
          <li><NuxtLink to="/register" class="link">Sign up</NuxtLink></li>
          <li><NuxtLink to="/settings/profile" class="link">Settings</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-surface-border">
      <div class="container-page py-4 text-xs text-ink-muted flex flex-wrap items-center justify-between gap-2">
        <span>© {{ year }} AskSphere. All rights reserved.</span>
        <span>Built with Nuxt, Tailwind, and MongoDB.</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>