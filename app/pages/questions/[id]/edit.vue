<template>
  <div class="max-w-3xl mx-auto">
    <div class="card p-6 sm:p-8">
      <h1 class="text-xl font-semibold text-ink">Edit question</h1>

      <LoadingState v-if="pending" label="Loading..." />

      <form v-else-if="form" class="mt-6 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label for="title" class="block text-sm font-medium text-ink mb-1">Title</label>
          <input id="title" v-model="form.title" type="text" maxlength="200" required class="input" />
        </div>

        <div>
          <label for="body" class="block text-sm font-medium text-ink mb-1">Details</label>
          <textarea id="body" v-model="form.body" rows="10" maxlength="10000" required class="input font-mono text-sm" />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-ink mb-1">Category</label>
          <select id="category" v-model="form.category" required class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label for="tags" class="block text-sm font-medium text-ink mb-1">Tags (comma separated)</label>
          <input id="tags" v-model="form.tagsInput" type="text" class="input" />
        </div>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <div class="flex gap-2">
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save changes' }}
          </button>
          <NuxtLink :to="`/questions/${id}`" class="btn-secondary">Cancel</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const categories = [
  'Technology', 'Programming', 'Science', 'Mathematics', 'Education',
  'Career', 'Business', 'Health and Wellness', 'Lifestyle',
  'General Knowledge', 'Other'
]

interface EditForm {
  title: string
  body: string
  category: string
  tagsInput: string
}

const form = ref<EditForm | null>(null)
const error = ref('')
const submitting = ref(false)

const { data, pending } = await useFetch<{ success: boolean; data: any }>(
  `/api/questions/${id}`
)

watch(
  data,
  (v) => {
    if (!v?.data) return
    form.value = {
      title: v.data.title,
      body: v.data.body,
      category: v.data.category,
      tagsInput: (v.data.tags ?? []).join(', ')
    }
  },
  { immediate: true }
)

async function onSubmit() {
  if (!form.value) return
  error.value = ''
  submitting.value = true
  try {
    const tags = form.value.tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean)
      .slice(0, 5)

    await $fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      body: {
        title: form.value.title,
        body: form.value.body,
        category: form.value.category,
        tags
      }
    })
    router.push(`/questions/${id}`)
  } catch (err: any) {
    error.value = err?.data?.error?.message || 'Save failed.'
  } finally {
    submitting.value = false
  }
}

useHead({ title: 'Edit question' })
</script>