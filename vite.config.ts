import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/templates/partials'),
      context: {
        appTitle: 'Chats Messenger',
        metaDescription: 'Статическая вёрстка на Vite + TypeScript + SCSS + Handlebars (partials + context).',
        year: new Date().getFullYear(),
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        registration: resolve(__dirname, 'registration.html'),
        profile: resolve(__dirname, 'profile.html'),
        notFound: resolve(__dirname, 'not-found.html'),
        serverError: resolve(__dirname, 'server-error.html'),
      },
    },
  },
})

