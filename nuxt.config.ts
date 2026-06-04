import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      meta: [
        // Подтверждение прав в Google Search Console
        { name: 'google-site-verification', content: '-ML7iNpPYmMZp25vlWwAYOqyhC6IqgJXIkgZTw2v8xg' },
        // Подтверждение прав в Яндекс.Вебмастере.
        // Замени значение content на код из webmaster.yandex.ru → Настройки → Права доступа
        { name: 'yandex-verification', content: 'bfc4bede51030a9c' },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/strapi',
  ],

  css: ['@/assets/css/main.css'],

  ui: {
    fonts: false,
  },

  strapi: {
    admin: process.env.STRAPI_ADMIN ?? '/admin',
    prefix: process.env.STRAPI_API_PREFIX ?? '/api',
    version: 'v5',
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: {
    dirs: [
      {
        path: '@/components',
        pathPrefix: false,
      },
    ]
  }
})