<template>
  <div class="max-w-2xl mx-auto">
    <div class="card p-6">
      <h1 class="text-xl font-semibold text-ink">Profile settings</h1>

      <form class="mt-6 space-y-5" @submit.prevent="onSubmit">
        <!-- Profile Picture Upload -->
        <div>
          <label class="block text-sm font-medium text-ink mb-2">Profile picture</label>
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full bg-primary text-white grid place-items-center text-xl font-semibold shrink-0 overflow-hidden border border-surface-border shadow-sm">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Avatar preview"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ user?.username?.charAt(0).toUpperCase() ?? '?' }}</span>
            </div>

            <div class="space-y-1.5">
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                class="hidden"
                @change="onFileSelected"
              />
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="btn-secondary text-xs"
                  :disabled="uploading"
                  @click="fileInput?.click()"
                >
                  {{ uploading ? 'Uploading...' : 'Upload picture' }}
                </button>
                <button
                  v-if="avatarUrl"
                  type="button"
                  class="btn-secondary text-xs text-danger"
                  :disabled="uploading"
                  @click="removeAvatar"
                >
                  Remove
                </button>
              </div>
              <p class="text-xs text-ink-muted">JPG, PNG, WebP or GIF. Max 5 MB.</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1" for="bio">Bio</label>
          <textarea id="bio" v-model="bio" rows="4" maxlength="500" class="input" />
          <p class="mt-1 text-xs text-ink-muted">{{ bio.length }} / 500</p>
        </div>

        <p v-if="message" class="text-sm text-success">{{ message }}</p>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <div class="flex items-center gap-3">
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save changes' }}
          </button>
          <NuxtLink v-if="user?.username" :to="`/users/${user.username}`" class="btn-secondary">
            View profile
          </NuxtLink>
        </div>
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

const fileInput = ref<HTMLInputElement | null>(null)
const bio = ref(user.value?.bio ?? '')
const avatarUrl = ref(user.value?.avatarUrl ?? '')
const message = ref('')
const error = ref('')
const submitting = ref(false)
const uploading = ref(false)

watch(user, (u) => {
  if (u) {
    bio.value = u.bio ?? ''
    avatarUrl.value = u.avatarUrl ?? ''
  }
})

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image must be under 5 MB.'
    target.value = ''
    return
  }

  error.value = ''
  message.value = ''
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await $fetch<{ success: boolean; data: { avatarUrl: string } }>(
      '/api/users/avatar',
      {
        method: 'POST',
        body: formData
      }
    )

    avatarUrl.value = res.data.avatarUrl
    await fetchMe()
    message.value = 'Profile picture updated.'
  } catch (err: any) {
    error.value =
      err?.data?.error?.message || err?.data?.message || 'Upload failed.'
  } finally {
    uploading.value = false
    target.value = ''
  }
}

async function removeAvatar() {
  if (!confirm('Remove your profile picture?')) return
  error.value = ''
  message.value = ''
  uploading.value = true

  try {
    await $fetch('/api/users/avatar', { method: 'DELETE' })
    avatarUrl.value = ''
    await fetchMe()
    message.value = 'Profile picture removed.'
  } catch (err: any) {
    error.value = err?.data?.error?.message || 'Could not remove profile picture.'
  } finally {
    uploading.value = false
  }
}

async function onSubmit() {
  message.value = ''
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/users/me', {
      method: 'PATCH',
      body: { bio: bio.value.trim(), avatarUrl: avatarUrl.value.trim() }
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