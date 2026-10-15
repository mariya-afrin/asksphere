<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-ink">Users</h1>

    <LoadingState v-if="pending" label="Loading users..." />

    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-surface text-ink-muted text-xs">
          <tr>
            <th class="text-left p-3">Username</th>
            <th class="text-left p-3">Email</th>
            <th class="text-left p-3">Role</th>
            <th class="text-left p-3">Status</th>
            <th class="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id" class="border-t border-surface-border">
            <td class="p-3">
              <NuxtLink :to="`/users/${u.username}`" class="link">{{ u.username }}</NuxtLink>
            </td>
            <td class="p-3 text-ink-muted">{{ u.email }}</td>
            <td class="p-3">{{ u.role }}</td>
            <td class="p-3">
              <span :class="u.status === 'suspended' ? 'text-danger' : 'text-success'">
                {{ u.status }}
              </span>
            </td>
            <td class="p-3 text-right space-x-1">
              <button
                v-if="u.status === 'active'"
                type="button"
                class="btn-danger text-xs"
                @click="setStatus(u.id, 'suspended')"
              >
                Suspend
              </button>
              <button
                v-else
                type="button"
                class="btn-secondary text-xs"
                @click="setStatus(u.id, 'active')"
              >
                Reactivate
              </button>
              <button
                v-if="u.role === 'user'"
                type="button"
                class="btn-secondary text-xs"
                @click="setRole(u.id, 'admin')"
              >
                Make admin
              </button>
              <button
                v-else
                type="button"
                class="btn-secondary text-xs"
                @click="setRole(u.id, 'user')"
              >
                Remove admin
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin — Users' })

interface AdminUser {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'suspended'
  reputation: number
  questionCount: number
  answerCount: number
  createdAt: string
}

const { data, pending, refresh } = await useFetch<{ success: boolean; data: { items: AdminUser[] } }>(
  '/api/admin/users'
)

const items = computed<AdminUser[]>(() => data.value?.data?.items ?? [])

async function setStatus(id: string, status: 'active' | 'suspended') {
  if (!confirm(`Set user status to "${status}"?`)) return
  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: { status } })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update.')
  }
}

async function setRole(id: string, role: 'user' | 'admin') {
  if (!confirm(`Change role to "${role}"?`)) return
  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: { role } })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update.')
  }
}
</script>