// nuxt.config.ts
// This is the main configuration file for our Nuxt application.
// It tells Nuxt which modules to load, how the app behaves, and
// where to find private configuration values.

export default defineNuxtConfig({
  // Enable Nuxt's built-in development tools and future-proof defaults.
  compatibilityDate: '2025-01-01',

  // Enable Nuxt DevTools (a helpful in-browser debugging panel).
  devtools: { enabled: true },

  // Nuxt modules we use. Tailwind provides our utility CSS classes.
  modules: ['@nuxtjs/tailwindcss'],

  // Global CSS file. It will contain Tailwind's layers and our design tokens.
  css: ['~/assets/css/main.css'],

  // Tailwind module configuration: where to find the config file.
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: true
  },

  // TypeScript strictness. Strict mode catches more mistakes at compile time.
  typescript: {
    strict: true,
    typeCheck: false // We run typecheck manually with `npm run typecheck`.
  },

  // Runtime configuration. `runtimeConfig` values are available on the server
  // via `useRuntimeConfig(event)`. Private values (not prefixed with PUBLIC_)
  // are NEVER sent to the browser. Public values are exposed as
  // `useRuntimeConfig().public.*` on both server and client.
  runtimeConfig: {
    // PRIVATE — server only. Read from environment variables automatically.
    mongodbUri: process.env.MONGODB_URI || '',
    sessionSecret: process.env.SESSION_SECRET || '',

    public: {
      // PUBLIC — exposed to the browser.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // Nitro is the server engine behind Nuxt. We configure it here for
  // future deployment targets. For now, defaults are fine.
  nitro: {
    // Recommended for Mongoose + serverless deployments later.
    // We will not enable this locally yet to keep things simple.
  },

  // Route rules let us pre-render some pages for speed. We leave the
  // defaults for now and add rules as the app grows.
  routeRules: {},

  // Application head defaults (title, meta tags).
  app: {
    head: {
      title: 'AskSphere',
      titleTemplate: '%s · AskSphere',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'AskSphere — Ask. Share. Learn Together. A community Q&A platform.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  }
})