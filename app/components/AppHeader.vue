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

      <div class="relative hidden lg:flex flex-1 max-w-md ml-auto">
        <form class="w-full" @submit.prevent="onSearch">
          <label class="sr-only" for="header-search">Search questions</label>
          <input
            id="header-search"
            v-model="searchTerm"
            type="search"
            placeholder="Search questions..."
            class="input w-full"
            autocomplete="off"
            @focus="onSearchFocus"
          />
        </form>

        <!-- Live search dropdown -->
        <div
          v-if="searchDropdownOpen && searchTerm.trim()"
          class="absolute left-0 right-0 top-full mt-1.5 card p-2 z-50 shadow-lg text-sm divide-y divide-surface-border bg-white"
          @mouseleave="searchDropdownOpen = false"
        >
          <div v-if="liveSearchLoading" class="p-3 text-xs text-ink-muted flex items-center justify-center gap-2">
            <span>Searching...</span>
          </div>

          <template v-else-if="liveSearchResults.length">
            <NuxtLink
              v-for="q in liveSearchResults"
              :key="q.id"
              :to="`/questions/${q.id}`"
              class="block p-2 rounded hover:bg-surface transition-colors"
              @click="closeSearchDropdown"
            >
              <div class="font-medium text-ink truncate">{{ q.title }}</div>
              <div class="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                <span class="tag text-[10px] py-0.5 px-1.5">{{ q.category }}</span>
                <span>{{ q.answerCount }} answers</span>
                <span>score {{ q.voteScore }}</span>
              </div>
            </NuxtLink>

            <button
              type="button"
              class="w-full text-left p-2 text-xs font-medium text-primary hover:bg-surface rounded pt-2 mt-1"
              @click="onSearch"
            >
              See all results for "{{ searchTerm.trim() }}" →
            </button>
          </template>

          <div v-else class="p-3 text-xs text-ink-muted text-center">
            No matching questions found.
          </div>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-2 lg:ml-0">
        <NuxtLink to="/ask" class="btn-primary hidden sm:inline-flex">Ask Question</NuxtLink>

        <template v-if="!isAuthenticated">
          <NuxtLink to="/login" class="btn-secondary">Log in</NuxtLink>
          <NuxtLink to="/register" class="btn-primary hidden sm:inline-flex">Sign up</NuxtLink>
        </template>

        <template v-else>
          <NuxtLink
            to="/notifications"
            class="relative rounded-lg p-2 text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Notifications"
          >
            <Bell class="h-5 w-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white leading-none"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </NuxtLink>
          <div class="relative">
            <button
              type="button"
              class="rounded-full h-8 w-8 bg-primary text-white grid place-items-center text-sm font-semibold overflow-hidden"
              @click="menuOpen = !menuOpen"
            >
              <img
                v-if="user?.avatarUrl"
                :src="user.avatarUrl"
                :alt="user.username"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ userInitial }}</span>
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchTerm = ref('')
const menuOpen = ref(false)
const searchDropdownOpen = ref(false)
const liveSearchLoading = ref(false)
const liveSearchResults = ref<any[]>([])

const { user, isAuthenticated, logout } = useAuth()

const userInitial = computed(() =>
  user.value?.username?.charAt(0)?.toUpperCase() ?? '?'
)

// Fetch notifications count when authenticated
const { data: notifData } = await useFetch<{
  success: boolean
  data: { unreadCount: number }
}>('/api/notifications', {
  immediate: isAuthenticated.value,
  server: false
})

const unreadCount = computed(() => notifData.value?.data?.unreadCount ?? 0)

// Debounced live search
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchTerm, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  const trimmed = val.trim()
  if (!trimmed) {
    liveSearchResults.value = []
    searchDropdownOpen.value = false
    return
  }

  liveSearchLoading.value = true
  searchDropdownOpen.value = true

  searchTimer = setTimeout(async () => {
    try {
      const res = await $fetch<{ success: boolean; data: { items: any[] } }>(
        '/api/questions',
        { query: { search: trimmed, limit: 5 } }
      )
      liveSearchResults.value = res.data?.items ?? []
    } catch {
      liveSearchResults.value = []
    } finally {
      liveSearchLoading.value = false
    }
  }, 200)
})

function onSearchFocus() {
  if (searchTerm.value.trim() && liveSearchResults.value.length > 0) {
    searchDropdownOpen.value = true
  }
}

function closeSearchDropdown() {
  searchDropdownOpen.value = false
}

function onSearch() {
  const q = searchTerm.value.trim()
  searchDropdownOpen.value = false
  if (!q) return
  router.push({ path: '/search', query: { q } })
}

async function onLogout() {
  menuOpen.value = false
  await logout()
  router.push('/')
}
</script>