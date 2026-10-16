<template>
  <div class="max-w-md mx-auto py-6 sm:py-10">
    <div class="card p-6 sm:p-8 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white font-bold text-xl shadow-sm mb-1">
          A
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
        <p class="text-sm text-ink-muted">Sign in to your AskSphere account to continue</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Email address
          </label>
          <div class="relative">
            <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="input pl-10"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Password
            </label>
          </div>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="input pl-10"
            />
          </div>
        </div>

        <div v-if="error" class="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-2">
          <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" class="btn-primary w-full py-2.5 text-sm font-semibold" :disabled="submitting">
          <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
          <span>{{ submitting ? 'Signing in...' : 'Sign in to account' }}</span>
        </button>
      </form>

      <!-- Public questions option card -->
      <div class="pt-4 border-t border-surface-border">
        <div class="rounded-xl p-3.5 bg-surface border border-surface-border/80 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Compass class="h-3.5 w-3.5 text-primary" />
              <span>Just browsing?</span>
            </div>
            <p class="text-xs text-ink-muted mt-0.5">Explore public questions & answers without an account.</p>
          </div>
          <NuxtLink
            to="/questions"
            class="btn-secondary text-xs shrink-0 py-1.5 px-3 font-semibold hover:border-primary/40 hover:text-primary transition-colors"
          >
            See questions →
          </NuxtLink>
        </div>
      </div>

      <!-- Footer navigation -->
      <div class="text-center text-xs text-ink-muted pt-1">
        Don't have an account yet?
        <NuxtLink to="/register" class="link font-semibold ml-1">Sign up</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Compass, Loader2, Lock, Mail } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

useHead({ title: 'Log in' })

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    // Nitro errors arrive as { data: { error: { message } } }
    error.value =
      err?.data?.error?.message ||
      err?.data?.message ||
      err?.message ||
      'Login failed. Please check your credentials.'
  } finally {
    submitting.value = false
  }
}
</script>