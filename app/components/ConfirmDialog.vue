<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      @click.self="$emit('cancel')"
    >
      <div class="card max-w-sm w-full p-6">
        <h2 class="text-base font-semibold text-ink">{{ title }}</h2>
        <p v-if="description" class="mt-2 text-sm text-ink-muted">{{ description }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="btn-secondary" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button type="button" class="btn-danger" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
  }>(),
  {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    description: ''
  }
)

defineEmits<{ confirm: []; cancel: [] }>()
</script>