<template>
  <div class="max-w-2xl mx-auto">
    <div class="card p-6">
      <h1 class="text-xl font-semibold text-ink">Profile settings</h1>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-ink mb-1" for="bio">Bio</label>
          <textarea id="bio" v-model="bio" rows="4" maxlength="500" class="input" />
          <p class="mt-1 text-xs text-ink-muted">{{ bio.length }} / 500</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1" for="avatar">Avatar URL</label>
          <input id="avatar" v-model="avatarUrl" type="url" placeholder="https://..." class="input" />
        </div>

        <p v-if="message" class="text-sm text-success">{{ message }}</p>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

useHead({ title: 'Profile settings' })

const { user, isAuthenticated, fetchMe } = useAuth()

if (!isAuthenticated.value) {
  await navigateTo('/login?next=/settings/profile')
}

const bio = ref(user.value?.bio ?? '')
const avatarUrl = ref(user.value?.avatarUrl ?? '')
const message = ref('')
const error = ref('')
const submitting = ref(false)

watch(user, (u) => {
  if (u) {
    bio.value = u.bio ?? ''
    avatarUrl.value = u.avatarUrl ?? ''
  }
})

async function onSubmit() {
  message.value = ''
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/users/me', {
      method: 'PATCH',
      body: { bio: bio.value, avatarUrl: avatarUrl.value }
    })
    await fetchMe()
    message.value = 'Saved.'
  } catch (err: any) {
    error.value = err?.data?.error?.message || 'Save failed.'
  } finally {
    submitting.value = false
  }
}
</script>