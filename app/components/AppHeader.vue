<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border/80 shadow-2xs">
    <div class="container-page flex h-16 items-center gap-4">
      <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0 group">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
          A
        </span>
        <span class="hidden sm:inline text-lg font-bold tracking-tight text-ink group-hover:text-primary transition-colors">
          AskSphere
        </span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1 ml-2">
        <NuxtLink
          to="/questions"
          class="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
          :class="isRouteActive('/questions') ? 'bg-primary/10 text-primary font-semibold' : 'text-ink-muted hover:bg-surface hover:text-ink'"
        >
          Questions
        </NuxtLink>
        <NuxtLink
          to="/categories"
          class="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
          :class="isRouteActive('/categories') ? 'bg-primary/10 text-primary font-semibold' : 'text-ink-muted hover:bg-surface hover:text-ink'"
        >
          Categories
        </NuxtLink>
        <NuxtLink
          to="/tags"
          class="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
          :class="isRouteActive('/tags') ? 'bg-primary/10 text-primary font-semibold' : 'text-ink-muted hover:bg-surface hover:text-ink'"
        >
          Tags
        </NuxtLink>
        <NuxtLink
          to="/leaderboard"
          class="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
          :class="isRouteActive('/leaderboard') ? 'bg-primary/10 text-primary font-semibold' : 'text-ink-muted hover:bg-surface hover:text-ink'"
        >
          Leaderboard
        </NuxtLink>
      </nav>

      <div class="relative hidden lg:flex flex-1 max-w-md ml-auto">
        <form class="w-full" @submit.prevent="onSearch">
          <label class="sr-only" for="header-search">Search questions</label>
          <div class="relative w-full">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="header-search"
              ref="desktopSearchInput"
              v-model="searchTerm"
              type="search"
              placeholder="Search questions & topics..."
              class="input w-full pl-9 pr-14 text-xs sm:text-sm"
              autocomplete="off"
              @focus="onSearchFocus"
            />
            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                v-if="searchTerm"
                type="button"
                class="text-ink-muted hover:text-ink p-0.5"
                aria-label="Clear search"
                @click="searchTerm = ''; searchDropdownOpen = false"
              >
                <X class="h-4 w-4" />
              </button>
              <kbd v-else class="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-ink-muted/80 bg-surface border border-surface-border rounded shadow-2xs pointer-events-none">
                Ctrl K
              </kbd>
            </div>
          </div>
        </form>

        <!-- Live search dropdown -->
        <div
          v-if="searchDropdownOpen && searchTerm.trim()"
          class="absolute left-0 right-0 top-full mt-2 card p-2 z-50 shadow-lg text-sm divide-y divide-surface-border bg-white"
          @mouseleave="searchDropdownOpen = false"
        >
          <div v-if="liveSearchLoading" class="p-3 text-xs text-ink-muted flex items-center justify-center gap-2">
            <span>Searching questions...</span>
          </div>

          <template v-else-if="liveSearchResults.length">
            <NuxtLink
              v-for="q in liveSearchResults"
              :key="q.id"
              :to="`/questions/${q.id}`"
              class="block p-2.5 rounded-xl hover:bg-surface transition-colors"
              @click="closeSearchDropdown"
            >
              <div class="font-medium text-ink truncate">{{ q.title }}</div>
              <div class="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                <span class="tag text-[10px] py-0.5 px-2 bg-primary/5 text-primary border-primary/20">{{ q.category }}</span>
                <span>{{ q.answerCount }} answers</span>
                <span>score {{ q.voteScore }}</span>
              </div>
            </NuxtLink>

            <button
              type="button"
              class="w-full text-left p-2.5 text-xs font-semibold text-primary hover:bg-surface rounded-xl pt-2.5 mt-1"
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
        <!-- Mobile Search Toggle Button -->
        <button
          type="button"
          class="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
          :aria-expanded="mobileSearchOpen"
          aria-label="Search"
          @click="toggleMobileSearch"
        >
          <X v-if="mobileSearchOpen" class="h-5 w-5" />
          <Search v-else class="h-5 w-5" />
        </button>

        <NuxtLink to="/ask" class="btn-primary text-xs sm:text-sm hidden sm:inline-flex">
          Ask question
        </NuxtLink>

        <ClientOnly>
          <template v-if="!isAuthenticated">
            <NuxtLink to="/login" class="btn-secondary text-xs sm:text-sm">Log in</NuxtLink>
            <NuxtLink to="/register" class="btn-primary text-xs sm:text-sm hidden sm:inline-flex">Sign up</NuxtLink>
          </template>

          <template v-else>
            <div class="relative inline-flex items-center justify-center shrink-0">
              <NuxtLink
                to="/notifications"
                class="inline-flex items-center justify-center rounded-xl p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
                aria-label="Notifications"
              >
                <Bell class="h-5 w-5" />
              </NuxtLink>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white leading-none pointer-events-none z-10 shadow-sm"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </div>
            <div class="relative">
              <button
                type="button"
                class="rounded-full h-8 w-8 bg-primary text-white grid place-items-center text-sm font-semibold overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all"
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
                class="absolute right-0 mt-2 w-48 card p-1.5 text-sm shadow-lg z-50 bg-white"
                @mouseleave="menuOpen = false"
              >
                <NuxtLink :to="`/users/${user?.username}`" class="block rounded-lg px-3 py-2 hover:bg-surface" @click="menuOpen = false">Profile</NuxtLink>
                <NuxtLink to="/settings/profile" class="block rounded-lg px-3 py-2 hover:bg-surface" @click="menuOpen = false">Settings</NuxtLink>
                <NuxtLink to="/bookmarks" class="block rounded-lg px-3 py-2 hover:bg-surface" @click="menuOpen = false">Bookmarks</NuxtLink>
                <div class="border-t border-surface-border my-1"></div>
                <button type="button" class="w-full text-left rounded-lg px-3 py-2 hover:bg-danger/5 text-danger font-medium" @click="onLogout">Log out</button>
              </div>
            </div>
          </template>

          <template #fallback>
            <div class="flex items-center gap-2">
              <NuxtLink to="/login" class="btn-secondary text-xs sm:text-sm">Log in</NuxtLink>
              <NuxtLink to="/register" class="btn-primary text-xs sm:text-sm hidden sm:inline-flex">Sign up</NuxtLink>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Mobile Search Drawer -->
    <div
      v-if="mobileSearchOpen"
      class="lg:hidden border-t border-surface-border bg-white px-4 py-2.5 shadow-sm"
    >
      <div class="relative w-full">
        <form @submit.prevent="onSearch">
          <label class="sr-only" for="mobile-header-search">Search questions</label>
          <div class="relative flex items-center">
            <Search class="absolute left-3 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="mobile-header-search"
              ref="mobileSearchInput"
              v-model="searchTerm"
              type="search"
              placeholder="Search questions..."
              class="input w-full pl-9 pr-8 text-sm"
              autocomplete="off"
              @focus="onSearchFocus"
            />
            <button
              v-if="searchTerm"
              type="button"
              class="absolute right-2.5 p-1 text-ink-muted hover:text-ink"
              aria-label="Clear search"
              @click="searchTerm = ''; searchDropdownOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </form>

        <!-- Live search dropdown for mobile -->
        <div
          v-if="searchDropdownOpen && searchTerm.trim()"
          class="mt-1.5 card p-2 z-50 shadow-lg text-sm divide-y divide-surface-border bg-white max-h-72 overflow-y-auto"
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
              @click="closeSearchDropdown(); mobileSearchOpen = false"
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell, Search, X } from 'lucide-vue-next'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const searchTerm = ref('')
const menuOpen = ref(false)
const mobileSearchOpen = ref(false)
const desktopSearchInput = ref<HTMLInputElement | null>(null)
const mobileSearchInput = ref<HTMLInputElement | null>(null)
const searchDropdownOpen = ref(false)
const liveSearchLoading = ref(false)
const liveSearchResults = ref<any[]>([])

function isRouteActive(pathPrefix: string) {
  if (pathPrefix === '/') return route.path === '/'
  return route.path.startsWith(pathPrefix)
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    desktopSearchInput.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

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

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value
  if (mobileSearchOpen.value) {
    if (searchTerm.value.trim() && liveSearchResults.value.length > 0) {
      searchDropdownOpen.value = true
    }
    nextTick(() => {
      mobileSearchInput.value?.focus()
    })
  } else {
    searchDropdownOpen.value = false
  }
}

// Close overlays on route change
router.afterEach(() => {
  mobileSearchOpen.value = false
  searchDropdownOpen.value = false
  menuOpen.value = false
})

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
  mobileSearchOpen.value = false
  if (!q) return
  router.push({ path: '/search', query: { q } })
}

async function onLogout() {
  menuOpen.value = false
  await logout()
  router.push('/')
}
</script>