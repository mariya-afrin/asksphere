<template>
  <header class="sticky top-0 z-40 bg-white border-b border-surface-border">
    <div class="container-page flex h-16 items-center gap-4">
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">A</span>
        <span class="hidden sm:inline text-lg font-semibold text-ink">AskSphere</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1 ml-2">
        <NuxtLink to="/questions" class="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink">Questions</NuxtLink>
        <NuxtLink to="/categories" class="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink">Categories</NuxtLink>
        <NuxtLink to="/tags" class="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink">Tags</NuxtLink>
        <NuxtLink to="/leaderboard" class="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink">Leaderboard</NuxtLink>
      </nav>

      <form class="hidden lg:flex flex-1 max-w-md ml-auto" @submit.prevent="onSearch">
        <label class="sr-only" for="header-search">Search questions</label>
        <input id="header-search" v-model="searchTerm" type="search" placeholder="Search questions..." class="input" />
      </form>

      <div class="ml-auto flex items-center gap-2 lg:ml-0">
        <NuxtLink to="/ask" class="btn-primary hidden sm:inline-flex">Ask Question</NuxtLink>

        <template v-if="!isAuthenticated">
          <NuxtLink to="/login" class="btn-secondary">Log in</NuxtLink>
          <NuxtLink to="/register" class="btn-primary hidden sm:inline-flex">Sign up</NuxtLink>
        </template>

        <template v-else>
          <NuxtLink to="/notifications" class="rounded-lg p-2 text-ink-muted hover:bg-surface hover:text-ink" aria-label="Notifications">
            <Bell class="h-5 w-5" />
          </NuxtLink>
          <div class="relative">
            <button
              type="button"
              class="rounded-full h-8 w-8 bg-primary text-white grid place-items-center text-sm font-semibold"
              @click="menuOpen = !menuOpen"
            >
              {{ userInitial }}
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 mt-2 w-48 card p-1 text-sm"
              @mouseleave="menuOpen = false"
            >
              <NuxtLink :to="`/users/${user?.username}`" class="block rounded px-3 py-2 hover:bg-surface" @click="menuOpen = false">Profile</NuxtLink>
              <NuxtLink to="/settings/profile" class="block rounded px-3 py-2 hover:bg-surface" @click="menuOpen = false">Settings</NuxtLink>
              <NuxtLink to="/bookmarks" class="block rounded px-3 py-2 hover:bg-surface" @click="menuOpen = false">Bookmarks</NuxtLink>
              <button type="button" class="w-full text-left rounded px-3 py-2 hover:bg-surface text-danger" @click="onLogout">Log out</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchTerm = ref('')
const menuOpen = ref(false)

const { user, isAuthenticated, logout } = useAuth()

const userInitial = computed(() =>
  user.value?.username?.charAt(0)?.toUpperCase() ?? '?'
)

function onSearch() {
  const q = searchTerm.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
}

async function onLogout() {
  menuOpen.value = false
  await logout()
  router.push('/')
}
</script>