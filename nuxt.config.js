export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'ProveYourself',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['ant-design-vue/dist/antd.css', '@/assets/style/main.scss'],

  // Server Middleware
  serverMiddleware: [{ path: '/api', handler: '~/server-middleware/rest.ts' }],

  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/antd-ui', '@/plugins/vue-json-pretty'],

  // Env Variables (shared across back and front end)
  env: {
    azureCVKeyOne: process.env.AZURE_CV_KEY_ONE || 'azure_cv_key_one',
    azureCVKeyTwo: process.env.AZURE_CV_KEY_TWO || 'azure_cv_key_two',
    azureCVRegion: process.env.AZURE_CV_REGION || 'australia',
    azureCVEndpoint:
      process.env.AZURE_CV_ENDPOINT ||
      'https://provendb-computer-vision.cognitiveservices.azure.com/',
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',

    ['@nuxtjs/google-fonts', {  display: 'swap', families: {
      Inconsolata: true
    }}]
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    // https://www.npmjs.com/package/nuxt-winston-log
    'nuxt-winston-log',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    browserBaseURL: 'http://localhost:8000',
    retry: true,
  },

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BROWSER_BASE_URL,
    },
  },

  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.BASE_URL,
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    loaders: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
          math: 'always',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extend(config, { loaders: { less } }) {
      less.javascriptEnabled = true
    },
  },
}
