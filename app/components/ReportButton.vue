<template>
  <button
    type="button"
    class="text-xs text-ink-muted hover:text-danger"
    @click="open = true"
  >
    Report
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      @click.self="open = false"
    >
      <div class="card max-w-sm w-full p-6">
        <h2 class="text-base font-semibold text-ink">Report content</h2>
        <p class="text-xs text-ink-muted mt-1">Tell us why this content is a problem.</p>

        <form class="mt-4 space-y-3" @submit.prevent="submit">
          <div>
            <label class="block text-sm font-medium text-ink mb-1" for="reason">Reason</label>
            <select id="reason" v-model="reason" class="input" required>
              <option value="spam">Spam</option>
              <option value="abuse">Abuse or harassment</option>
              <option value="off-topic">Off-topic</option>
              <option value="duplicate">Duplicate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1" for="details">Details (optional)</label>
            <textarea id="details" v-model="details" rows="3" maxlength="1000" class="input" />
          </div>

          <p v-if="error" class="text-sm text-danger">{{ error }}</p>
          <p v-if="done" class="text-sm text-success">Report submitted. Thank you.</p>

          <div class="flex gap-2 justify-end">
            <button type="button" class="btn-secondary" @click="open = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting || done">
              {{ submitting ? 'Submitting...' : 'Submit report' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  targetType: 'question' | 'answer' | 'comment'
  targetId: string
}>()

const open = ref(false)
const reason = ref<'spam' | 'abuse' | 'off-topic' | 'duplicate' | 'other'>('spam')
const details = ref('')
const error = ref('')
const done = ref(false)
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/reports', {
      method: 'POST',
      body: {
        targetType: props.targetType,
        targetId: props.targetId,
        reason: reason.value,
        details: details.value
      }
    })
    done.value = true
  } catch (err: any) {
    error.value = err?.data?.error?.message || 'Could not submit report.'
  } finally {
    submitting.value = false
  }
}
</script>