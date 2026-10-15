// app/composables/useAuth.ts
// Frontend auth state. Shared across all components.

export interface AuthUser {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  reputation: number
  bio: string
  avatarUrl: string
  questionCount: number
  answerCount: number
  acceptedAnswerCount: number
}

export function useAuth() {
  // useState is Nuxt's SSR-safe shared state.
  const user = useState<AuthUser | null>('auth:user', () => null)
  const loading = useState<boolean>('auth:loading', () => false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchMe() {
    loading.value = true
    try {
      const res = await $fetch<{ success: boolean; data: { user: AuthUser | null } }>(
        '/api/auth/me'
      )
      user.value = res.data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch<{ success: boolean; data: AuthUser }>(
      '/api/auth/login',
      { method: 'POST', body: { email, password } }
    )
    user.value = res.data
    return res.data
  }

  async function register(input: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) {
    const res = await $fetch<{ success: boolean; data: AuthUser }>(
      '/api/auth/register',
      { method: 'POST', body: input }
    )
    user.value = res.data
    return res.data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loading, isAuthenticated, isAdmin, fetchMe, login, register, logout }
}