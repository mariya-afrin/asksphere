// app/middleware/admin.ts
// Client-side guard. The server still checks every admin API call.

export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchMe, isAdmin } = useAuth()

  if (!user.value) {
    await fetchMe()
  }

  if (!user.value) {
    return navigateTo('/login?next=/admin')
  }

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})