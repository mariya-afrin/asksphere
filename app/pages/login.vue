<template>
  <div class="max-w-md mx-auto">
    <div class="card p-6 sm:p-8">
      <h1 class="text-xl font-semibold text-ink">Welcome back</h1>
      <p class="mt-1 text-sm text-ink-muted">Log in to your AskSphere account.</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-ink mb-1">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="email" required class="input" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-ink mb-1">Password</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required class="input" />
        </div>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-ink-muted">
        No account?
        <NuxtLink to="/register" class="link">Sign up</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
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
      'Login failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>