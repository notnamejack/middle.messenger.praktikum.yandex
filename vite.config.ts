import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
  appType: 'spa',
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
      partialDirectory: resolve(__dirname, 'src/components'),
      context: {
        appTitle: 'Chats Messenger',
        metaDescription: 'Статическая вёрстка на Vite + TypeScript + SCSS + Handlebars (partials + context).',
        year: new Date().getFullYear(),
        chats: [
          { name: 'Андрей', text: 'Изображение', time: '10:49', count: 2 },
          { name: 'Киноклуб', text: 'стикер', time: '10:49', prefix: 'Вы: ' },
          { name: 'Илья', text: 'Друзья, у меня...', time: '10:49', count: 4 },
        ]
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})

