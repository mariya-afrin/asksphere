<template>
  <div class="space-y-2">
    <div v-if="loading" class="text-xs text-ink-muted">Loading comments...</div>

    <div v-else-if="comments.length === 0" class="text-xs text-ink-muted">
      No comments yet.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="c in comments"
        :key="c.id"
        class="text-xs text-ink-muted flex items-start gap-2"
      >
        <span class="shrink-0">
          <NuxtLink :to="`/users/${c.author.username}`" class="link">{{ c.author.username }}</NuxtLink>
          <span>:</span>
        </span>
        <template v-if="editingId !== c.id">
          <span class="flex-1 whitespace-pre-wrap">{{ c.body }}</span>
          <button
            v-if="canEdit(c)"
            type="button"
            class="text-ink-muted hover:text-ink"
            @click="startEdit(c.id, c.body)"
          >
            edit
          </button>
          <button
            v-if="canEdit(c)"
            type="button"
            class="text-danger hover:opacity-80"
            @click="$emit('delete', c.id)"
          >
            delete
          </button>
        </template>
        <template v-else>
          <input
            v-model="editingBody"
            class="input flex-1 text-xs"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
          />
          <button type="button" class="text-primary" @click="saveEdit">save</button>
          <button type="button" class="text-ink-muted" @click="cancelEdit">cancel</button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CommentItem {
  id: string
  body: string
  createdAt: string
  author: { id: string | null; username: string }
}

const props = defineProps<{
  comments: CommentItem[]
  loading?: boolean
  currentUserId?: string | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  update: [id: string, body: string]
  delete: [id: string]
}>()

const editingId = ref<string | null>(null)
const editingBody = ref('')

function canEdit(c: CommentItem) {
  if (!props.currentUserId) return false
  return c.author.id === props.currentUserId || props.isAdmin === true
}

function startEdit(id: string, body: string) {
  editingId.value = id
  editingBody.value = body
}

function cancelEdit() {
  editingId.value = null
  editingBody.value = ''
}

function saveEdit() {
  if (!editingId.value) return
  const body = editingBody.value.trim()
  if (!body) return
  emit('update', editingId.value, body)
  cancelEdit()
}
</script>