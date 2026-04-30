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
})

