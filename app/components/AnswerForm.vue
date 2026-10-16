<template>
  <form class="liquid-glass p-5 space-y-4" @submit.prevent="onSubmit">
    <h3 class="text-sm font-semibold text-ink">
      {{ editing ? 'Edit your answer' : 'Your answer' }}
    </h3>

    <textarea
      v-model="body"
      rows="6"
      maxlength="10000"
      required
      placeholder="Share your knowledge. Be clear and helpful."
      class="input font-mono text-sm"
    />

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <div class="flex gap-2">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Saving...' : editing ? 'Save changes' : 'Post answer' }}
      </button>
      <button v-if="editing" type="button" class="btn-secondary" @click="$emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  editing?: boolean
  initialBody?: string
}>()

const emit = defineEmits<{
  submit: [body: string]
  cancel: []
}>()

const body = ref(props.initialBody ?? '')
const error = ref('')
const submitting = ref(false)

watch(
  () => props.initialBody,
  (v) => {
    if (v !== undefined) body.value = v
  }
)

function onSubmit() {
  error.value = ''
  if (body.value.trim().length < 10) {
    error.value = 'Answer must be at least 10 characters.'
    return
  }
  submitting.value = true
  emit('submit', body.value.trim())
  // Parent will reset `submitting` via prop when done — simplified here.
  setTimeout(() => { submitting.value = false }, 500)
}
</script>
