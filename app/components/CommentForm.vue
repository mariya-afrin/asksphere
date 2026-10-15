<template>
  <form class="flex gap-2" @submit.prevent="onSubmit">
    <input
      v-model="body"
      type="text"
      maxlength="1000"
      placeholder="Add a comment..."
      class="input text-xs"
      :disabled="!canComment"
    />
    <button
      type="submit"
      class="btn-secondary text-xs shrink-0"
      :disabled="!canComment || submitting || !body.trim()"
    >
      Comment
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ canComment: boolean }>()
const emit = defineEmits<{ submit: [body: string] }>()

const body = ref('')
const submitting = ref(false)

function onSubmit() {
  const value = body.value.trim()
  if (!value) return
  submitting.value = true
  emit('submit', value)
  body.value = ''
  setTimeout(() => { submitting.value = false }, 300)
}
</script>