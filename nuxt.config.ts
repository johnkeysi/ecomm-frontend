// Frontend project → nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vuetify-nuxt-module'],

  vuetify: {
    vuetifyOptions: {
      icons: { defaultSet: 'mdi' },

      theme: {
        // The default light theme is still used by /products (Product Management).
        defaultTheme: 'light',
        themes: {
          // Custom dark theme used only by the Homepage (index.vue)
          // through <v-theme-provider theme="shopkartDark">.
          shopkartDark: {
            dark: true,
            colors: {
              background: '#07090D',
              surface: '#0F141B',
              'surface-variant': '#151C25',
              'on-surface-variant': '#E8EDF2',
              primary: '#14E0B4',
              'on-primary': '#04120E',
              secondary: '#22D3EE',
              'on-secondary': '#04120E',
              success: '#22C55E',
              warning: '#F59E0B',
              error: '#F43F5E',
              info: '#38BDF8',
            },
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      strapiUrl: 'http://localhost:1337',
    },
  },
})