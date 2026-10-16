<template>
  <div class="max-w-md mx-auto py-6 sm:py-10">
    <div class="card p-6 sm:p-8 bg-white border border-surface-border shadow-sm space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white font-bold text-xl shadow-sm mb-1">
          A
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-ink">Create your account</h1>
        <p class="text-sm text-ink-muted">Join AskSphere to ask, answer, and learn together</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Username
          </label>
          <div class="relative">
            <UserIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              required
              placeholder="alex_dev"
              class="input pl-10"
            />
          </div>
        </div>

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
              placeholder="alex@example.com"
              class="input pl-10"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Password
          </label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              placeholder="At least 6 characters"
              class="input pl-10"
            />
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Confirm password
          </label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              placeholder="Repeat password"
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
          <span>{{ submitting ? 'Creating account...' : 'Create free account' }}</span>
        </button>
      </form>

      <!-- Public questions option card -->
      <div class="pt-4 border-t border-surface-border">
        <div class="rounded-xl p-3.5 bg-surface border border-surface-border/80 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Compass class="h-3.5 w-3.5 text-primary" />
              <span>Want to explore first?</span>
            </div>
            <p class="text-xs text-ink-muted mt-0.5">Read questions & community discussions without registering.</p>
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
        Already have an account?
        <NuxtLink to="/login" class="link font-semibold ml-1">Log in</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Compass, Loader2, Lock, Mail, User as UserIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

useHead({ title: 'Sign up' })

const router = useRouter()
const { register } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    router.push('/')
  } catch (err: any) {
    error.value =
      err?.data?.error?.message ||
      err?.data?.message ||
      err?.message ||
      'Registration failed. Please check the details.'
  } finally {
    submitting.value = false
  }
}
</script>