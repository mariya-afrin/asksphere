// app/plugins/auth-init.client.ts
// Runs once when the app loads in the browser.
// Loads the current user from the session cookie.

export default defineNuxtPlugin(async () => {
  const auth = useAuth()
  if (!auth.user.value) {
    await auth.fetchMe()
  }
})