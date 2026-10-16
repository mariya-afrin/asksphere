// tailwind.config.ts
// Tailwind reads this file to know which files to scan for class names
// and which custom design tokens (colors, fonts, etc.) to make available.

import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  // Where to look for Tailwind class names. If a file is not listed here,
  // Tailwind will not generate CSS for classes used inside it.
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],

  theme: {
    extend: {
      // Design tokens from the AskSphere brand.
      colors: {
        // Primary brand green
        primary: {
          DEFAULT: '#176B4D',
          hover: '#11563D',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#176B4D',
          600: '#11563D',
          700: '#0C4230'
        },
        // Page backgrounds
        surface: {
          DEFAULT: '#F8FAF9',
          card: '#FFFFFF',
          border: '#E2E8F0'
        },
        // Text colors
        ink: {
          DEFAULT: '#17231D',
          muted: '#64748B'
        },
        // Status colors
        success: '#16A34A',
        danger: '#DC2626'
      },
      fontFamily: {
        // We use the system font stack for speed and familiarity.
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      borderRadius: {
        // Slightly larger default radius for a friendlier feel.
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)'
      }
    }
  },

  plugins: []
}