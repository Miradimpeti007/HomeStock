// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
<<<<<<< HEAD
  
  components: {
    dirs: [{ path: '~/components/layouts', pathPrefix: false }]
  },
  
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
=======
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
>>>>>>> walidTest
})
