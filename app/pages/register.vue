<template>
  <div class="max-w-md mx-auto">
    <div class="card p-6 sm:p-8">
      <h1 class="text-xl font-semibold text-ink">Create your account</h1>
      <p class="mt-1 text-sm text-ink-muted">Join AskSphere and start asking and answering.</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="username" class="block text-sm font-medium text-ink mb-1">Username</label>
          <input id="username" v-model="username" type="text" autocomplete="username" required class="input" />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-ink mb-1">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="email" required class="input" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-ink mb-1">Password</label>
          <input id="password" v-model="password" type="password" autocomplete="new-password" required class="input" />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-ink mb-1">Confirm password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" autocomplete="new-password" required class="input" />
        </div>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-ink-muted">
        Already have an account?
        <NuxtLink to="/login" class="link">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
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
      'Registration failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>