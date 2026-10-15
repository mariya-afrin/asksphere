<template>
  <div class="max-w-3xl mx-auto">
    <div class="card p-6 sm:p-8">
      <h1 class="text-xl font-semibold text-ink">Ask a question</h1>
      <p class="mt-1 text-sm text-ink-muted">
        Be specific. Include enough detail so people can give you a useful answer.
      </p>

      <form class="mt-6 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label for="title" class="block text-sm font-medium text-ink mb-1">Title</label>
          <input
            id="title"
            v-model="title"
            type="text"
            maxlength="200"
            required
            placeholder="e.g. How do I connect Nuxt to MongoDB Atlas?"
            class="input"
          />
          <p class="mt-1 text-xs text-ink-muted">{{ title.length }} / 200</p>
        </div>

        <div>
          <label for="body" class="block text-sm font-medium text-ink mb-1">Details</label>
          <textarea
            id="body"
            v-model="body"
            rows="10"
            maxlength="10000"
            required
            placeholder="Describe what you tried, what happened, and what you expected."
            class="input font-mono text-sm"
          />
          <p class="mt-1 text-xs text-ink-muted">{{ body.length }} / 10000</p>
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-ink mb-1">Category</label>
          <select id="category" v-model="category" required class="input">
            <option disabled value="">Choose a category...</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label for="tags" class="block text-sm font-medium text-ink mb-1">
            Tags <span class="text-ink-muted font-normal">(comma separated, max 5)</span>
          </label>
          <input
            id="tags"
            v-model="tagsInput"
            type="text"
            placeholder="javascript, nuxt, mongodb"
            class="input"
          />
        </div>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <div class="flex gap-2">
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Posting...' : 'Post question' }}
          </button>
          <NuxtLink to="/" class="btn-secondary">Cancel</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

useHead({ title: 'Ask a question' })

const router = useRouter()
const { isAuthenticated } = useAuth()

// Block guests from even seeing the form — redirect them to login.
if (!isAuthenticated.value) {
  await navigateTo('/login?next=/ask')
}

// The list must match the `CATEGORIES` array on the server.
const categories = [
  'Technology',
  'Programming',
  'Science',
  'Mathematics',
  'Education',
  'Career',
  'Business',
  'Health and Wellness',
  'Lifestyle',
  'General Knowledge',
  'Other'
]

const title = ref('')
const body = ref('')
const category = ref('')
const tagsInput = ref('')
const error = ref('')
const submitting = ref(false)

const tags = computed(() =>
  tagsInput.value
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
    .slice(0, 5)
)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; data: { id: string } }>(
      '/api/questions',
      {
        method: 'POST',
        body: {
          title: title.value,
          body: body.value,
          category: category.value,
          tags: tags.value
        }
      }
    )
    router.push(`/questions/${res.data.id}`)
  } catch (err: any) {
    error.value =
      err?.data?.error?.message ||
      err?.data?.message ||
      err?.message ||
      'Could not post the question.'
  } finally {
    submitting.value = false
  }
}
</script>