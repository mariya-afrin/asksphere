<template>
  <!-- Visitors get a focused, standalone first impression: no application chrome. -->
  <div v-if="!isAuthenticated" class="landing-page overflow-hidden bg-[#f8fbfa] text-slate-950">
    <div class="landing-orb landing-orb-one"></div><div class="landing-orb landing-orb-two"></div><div class="landing-grid"></div>
    <main class="relative mx-auto flex min-h-screen max-w-[1360px] items-center px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
      <section class="w-full rounded-[2rem] border border-white/80 bg-white/48 px-6 py-8 shadow-[0_24px_70px_-42px_rgba(8,53,40,.46)] backdrop-blur-xl sm:rounded-[2.5rem] sm:px-10 sm:py-10 lg:px-12 lg:py-11">
        <div class="grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-12">
          <div class="max-w-2xl">
            <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="AskSphere home"><span class="grid h-11 w-11 place-items-center rounded-2xl bg-[#0d513c] text-lg font-black text-white shadow-lg shadow-emerald-950/20">A</span><span class="text-lg font-bold tracking-[-0.04em] text-[#123c30]">AskSphere</span></NuxtLink>
            <div class="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#176b4d]"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,.12)]"></span>A thoughtful place to learn out loud</div>
            <h1 class="mt-5 max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.055em] text-[#092f25] sm:text-5xl lg:text-[3.5rem]">Every good answer starts with a curious mind.</h1>
            <p class="mt-5 max-w-lg text-base leading-7 text-slate-600">Ask real questions, learn from people who care, and leave each conversation a little wiser than you arrived.</p>
            <div class="mt-7 flex flex-col gap-3 sm:flex-row"><NuxtLink to="/register" class="landing-primary">Join the conversation <ArrowRight class="h-4 w-4" /></NuxtLink><NuxtLink to="/login" class="landing-secondary">I have an account</NuxtLink></div>
            <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500"><span class="inline-flex items-center gap-2"><Check class="h-4 w-4 text-emerald-600" />Free to join</span><span class="inline-flex items-center gap-2"><Check class="h-4 w-4 text-emerald-600" />Built for generous learning</span></div>
          </div>
          <div class="relative mx-auto w-full max-w-[480px] lg:mx-0"><div class="absolute -inset-8 rounded-full bg-gradient-to-tr from-emerald-300/28 via-teal-100/25 to-indigo-200/30 blur-3xl"></div><div class="conversation-orbit" aria-hidden="true"><span class="orbit-ring orbit-ring-one"></span><span class="orbit-ring orbit-ring-two"></span><span class="orbit-node orbit-node-one"></span><span class="orbit-node orbit-node-two"></span><span class="orbit-node orbit-node-three"></span></div>
            <div class="relative rounded-[1.8rem] border border-white/85 bg-white/58 p-4 shadow-[0_26px_60px_-36px_rgba(9,47,37,.4)] backdrop-blur-xl sm:p-5">
              <div class="flex items-center justify-between border-b border-emerald-950/5 pb-4"><div class="flex items-center gap-2.5"><span class="grid h-9 w-9 place-items-center rounded-xl bg-[#e6f5ed] text-[#176b4d]"><MessagesSquare class="h-4 w-4" /></span><div><p class="text-sm font-bold text-[#153d31]">Today’s discussion</p><p class="text-[11px] text-slate-500">Thoughtful answers, no noise</p></div></div><span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live</span></div>
              <article class="mt-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm"><div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-rose-200 text-xs font-bold text-rose-700">M</span><div><p class="text-xs font-semibold text-slate-700">Maya L.</p><p class="mt-1 text-sm font-bold leading-5 text-slate-800">How do I make time to learn something new without burning out?</p></div></div><div class="mt-4 flex gap-1.5"><span class="preview-tag">learning</span><span class="preview-tag">career</span><span class="preview-tag">wellbeing</span></div><div class="mt-4 flex items-center gap-4 text-xs text-slate-400"><span class="inline-flex items-center gap-1"><Heart class="h-3.5 w-3.5 text-rose-400" />24</span><span class="inline-flex items-center gap-1"><MessageCircle class="h-3.5 w-3.5 text-[#3c9575]" />8 helpful replies</span></div></article>
              <article class="mt-3 ml-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-[#f4fbf7] to-white p-4"><div class="flex gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0d513c] text-[10px] font-bold text-white">AR</span><div><p class="text-xs font-semibold text-[#215443]">Ari R. <span class="font-normal text-slate-400">· mentor</span></p><p class="mt-1 text-xs leading-5 text-slate-600">Start smaller than you think. A consistent twenty minutes is more powerful than a perfect plan you never begin.</p></div></div></article>
              <div class="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-white/55 px-3.5 py-3 text-xs text-slate-500"><Sparkles class="h-4 w-4 text-amber-500" />Your next useful conversation is waiting.</div>
            </div><div class="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-md sm:block"><p class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">A calmer community</p><p class="mt-0.5 text-xs font-medium text-slate-600">Curiosity is welcome here.</p></div>
          </div>
        </div>
      </section>
    </main><div class="relative pb-6 text-center text-xs text-slate-400">Ask. Share. Learn together.</div>
  </div>

  <!-- Signed-in users enter the actual product, with navigation supplied by the layout. -->
  <div v-else class="dashboard-page space-y-5 rounded-[2rem] p-1 sm:p-2">
    <section class="dashboard-hero relative overflow-hidden rounded-[1.7rem] px-6 py-8 text-white sm:px-9 sm:py-10"><div class="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl"></div><div class="absolute -bottom-28 left-1/3 h-56 w-96 rounded-full bg-teal-300/15 blur-3xl"></div><div class="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold text-emerald-100">Welcome back, {{ user?.username }}</p><h1 class="dashboard-hero-title mt-2 max-w-xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">What are you curious about today?</h1><p class="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80">Pick up a discussion, share what you know, or bring a new question to the community.</p></div><NuxtLink to="/ask" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-3 text-sm font-bold text-[#0d513c] shadow-lg shadow-emerald-950/10 transition-all hover:-translate-y-0.5 hover:bg-white"><Plus class="h-4 w-4" />Ask a question</NuxtLink></div></section>
    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><section class="dashboard-panel rounded-[1.7rem] p-5 sm:p-6"><div class="flex items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-primary">Community feed</p><h2 class="mt-1 text-xl font-bold">Fresh conversations</h2></div><NuxtLink to="/questions" class="text-sm font-semibold text-primary">View all <ArrowRight class="ml-1 inline h-4 w-4" /></NuxtLink></div><div class="mt-5 flex gap-2 overflow-x-auto pb-1"><button v-for="tab in tabs" :key="tab.value" class="whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition" :class="activeTab === tab.value ? 'bg-primary text-white shadow-sm' : 'bg-white/70 text-ink-muted hover:bg-primary/10 hover:text-primary'" @click="activeTab = tab.value"><component :is="tab.icon" class="mr-1.5 inline h-4 w-4" />{{ tab.label }}</button></div><div class="mt-5 space-y-3"><LoadingState v-if="pending" label="Loading conversations..." /><template v-else-if="visibleQuestions.length"><QuestionCard v-for="q in visibleQuestions" :key="q.id" :question="q" /><Pagination :page="currentPage" :total-pages="totalPages" @change="goToPage" /></template><EmptyState v-else title="No questions yet" description="Be the first to start a valuable discussion."><template #action><NuxtLink to="/ask" class="btn-primary">Ask the first question</NuxtLink></template></EmptyState></div></section>
      <aside class="space-y-5"><section class="dashboard-panel dashboard-contribution rounded-[1.7rem] p-5"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 text-primary shadow-sm"><Award class="h-5 w-5" /></span><div><p class="text-sm font-bold text-ink">Your contribution</p><p class="text-xs text-ink-muted">Every helpful answer matters.</p></div></div><div class="mt-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/65 px-4 py-3"><span class="text-xs font-medium text-ink-muted">Reputation</span><span class="text-lg font-black text-primary">{{ user?.reputation ?? 0 }}</span></div></section><section class="dashboard-panel dashboard-explore rounded-[1.7rem] p-5"><p class="text-xs font-bold uppercase tracking-[.16em] text-[#315e98]">Explore</p><div class="mt-3 space-y-1"><NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="dashboard-explore-link flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium"><span class="flex items-center gap-2"><component :is="link.icon" class="h-4 w-4" />{{ link.label }}</span><ChevronRight class="h-4 w-4" /></NuxtLink></div></section></aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Award, Bookmark, Check, ChevronRight, Clock, Compass, Flame, Heart, HelpCircle, MessageCircle, MessagesSquare, Plus, Sparkles } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import type { QuestionCardData } from '~/components/QuestionCard.vue'

useHead({ title: 'AskSphere · Ask. Share. Learn Together.' })
const { user, isAuthenticated } = useAuth()
type TabValue = 'latest' | 'popular' | 'unanswered'
const tabs = [{ value: 'latest' as TabValue, label: 'Latest', icon: Clock }, { value: 'popular' as TabValue, label: 'Popular', icon: Flame }, { value: 'unanswered' as TabValue, label: 'Unanswered', icon: HelpCircle }]
const quickLinks = [{ label: 'Explore questions', to: '/questions', icon: MessagesSquare }, { label: 'Saved bookmarks', to: '/bookmarks', icon: Bookmark }, { label: 'Topics & categories', to: '/categories', icon: Compass }]
const activeTab = ref<TabValue>('latest')
const currentPage = ref(1)
const { data, pending } = await useFetch<{ success: boolean; data: { items: QuestionCardData[]; totalPages: number } }>('/api/questions', { query: computed(() => ({ sort: activeTab.value, page: currentPage.value, limit: 7 })) })
const visibleQuestions = computed<QuestionCardData[]>(() => data.value?.data?.items ?? [])
const totalPages = computed(() => data.value?.data?.totalPages ?? 0)

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(1, page), Math.max(1, totalPages.value))
}

watch(activeTab, () => {
  currentPage.value = 1
})
</script>
