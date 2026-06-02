import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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