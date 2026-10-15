<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-ink">Reports</h1>

    <div class="flex gap-2">
      <button
        v-for="s in ['pending', 'resolved', 'dismissed']"
        :key="s"
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm border"
        :class="status === s ? 'bg-primary text-white border-primary' : 'bg-white text-ink-muted border-surface-border hover:bg-surface'"
        @click="setStatus(s)"
      >
        {{ s }}
      </button>
    </div>

    <LoadingState v-if="pending" label="Loading reports..." />

    <div v-else-if="items.length" class="card divide-y divide-surface-border">
      <div v-for="r in items" :key="r.id" class="p-4 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-medium text-ink">
              {{ r.reason }} on {{ r.targetType }}
            </div>
            <div class="text-xs text-ink-muted">
              Reported by {{ r.reporter.username }} · {{ new Date(r.createdAt).toLocaleString() }}
            </div>
          </div>
          <NuxtLink
            v-if="r.targetType === 'question'"
            :to="`/questions/${r.targetId}`"
            class="btn-secondary text-xs"
          >
            Open
          </NuxtLink>
        </div>
        <p v-if="r.details" class="text-sm text-ink">{{ r.details }}</p>

        <div v-if="r.status === 'pending'" class="flex flex-wrap gap-2 pt-2">
          <button type="button" class="btn-danger text-xs" @click="resolve(r.id, true)">
            Remove content + resolve
          </button>
          <button type="button" class="btn-secondary text-xs" @click="resolve(r.id, false)">
            Dismiss
          </button>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      title="No reports"
      description="Nothing to review in this category."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin — Reports' })

const route = useRoute()
const router = useRouter()

const status = computed(() => (route.query.status as string) || 'pending')

interface ReportItem {
  id: string
  targetType: string
  targetId: string
  reason: string
  details: string
  status: string
  createdAt: string
  reporter: { id: string | null; username: string }
}

const { data, pending, refresh } = await useFetch<{ success: boolean; data: { items: ReportItem[] } }>(
  '/api/admin/reports',
  { query: computed(() => ({ status: status.value })) }
)

const items = computed<ReportItem[]>(() => data.value?.data?.items ?? [])

function setStatus(s: string) {
  router.push({ query: { status: s } })
}

async function resolve(id: string, removeContent: boolean) {
  const note = prompt('Optional note (leave blank to skip):') ?? ''
  try {
    await $fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      body: {
        status: removeContent ? 'resolved' : 'dismissed',
        removeContent,
        reviewNote: note
      }
    })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.error?.message || 'Could not update report.')
  }
}
</script>