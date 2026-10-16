<!-- app/components/AppFooter.vue
 * Simple footer with links and copyright.
 -->
<template>
  <footer class="border-t border-surface-border bg-white mt-16">
    <div class="container-page py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
      <div class="space-y-3 sm:col-span-2">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white text-sm font-bold shadow-xs">
            A
          </span>
          <span class="font-bold text-base text-ink">AskSphere</span>
        </NuxtLink>
        <p class="text-xs sm:text-sm text-ink-muted max-w-sm leading-relaxed">
          Ask. Share. Learn Together. An open, distraction-free community platform where curiosity meets real-world answers.
        </p>
        <div class="flex items-center gap-2 pt-1 text-xs text-ink-muted">
          <span class="inline-block h-2 w-2 rounded-full bg-success"></span>
          <span>Open public knowledge exchange</span>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-ink mb-3">Explore</h3>
        <ul class="space-y-2 text-xs sm:text-sm">
          <li><NuxtLink to="/questions" class="text-ink-muted hover:text-primary transition-colors">Public Questions</NuxtLink></li>
          <li><NuxtLink to="/categories" class="text-ink-muted hover:text-primary transition-colors">Categories & Spheres</NuxtLink></li>
          <li><NuxtLink to="/tags" class="text-ink-muted hover:text-primary transition-colors">Popular Tags</NuxtLink></li>
          <li><NuxtLink to="/leaderboard" class="text-ink-muted hover:text-primary transition-colors">Reputation Leaderboard</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-ink mb-3">Community</h3>
        <ul class="space-y-2 text-xs sm:text-sm">
          <li><NuxtLink to="/ask" class="text-ink-muted hover:text-primary transition-colors">Ask a Question</NuxtLink></li>
          <li><NuxtLink to="/login" class="text-ink-muted hover:text-primary transition-colors">Log In</NuxtLink></li>
          <li><NuxtLink to="/register" class="text-ink-muted hover:text-primary transition-colors">Create Account</NuxtLink></li>
          <li><NuxtLink to="/search" class="text-ink-muted hover:text-primary transition-colors">Search Topics</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-surface-border/80 bg-surface/50">
      <div class="container-page py-4 text-xs text-ink-muted flex flex-wrap items-center justify-between gap-2">
        <span>© {{ year }} AskSphere. Free & open community platform.</span>
        <span>Built with Nuxt, Tailwind CSS & MongoDB.</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>