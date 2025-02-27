import glob from 'glob'
import path from 'path'
import postcssImport from 'postcss-import'
import postcssNesting from 'postcss-nesting'
import postcssPresetEnv from 'postcss-preset-env'
import * as SITE_INFO from './assets/content/site/info.json'
import { COLOR_MODE_FALLBACK } from './utils/globals.js'
import en from './locales/en-US.js'
import be from './locales/be-BE.js'

const dynamicContentPath = 'assets/content' // ? No prepending/appending backslashes here
const dynamicRoutes = getDynamicPaths(
  {
    blog: 'blog/*.json',
    connections: 'connections/*.json'
  },
  dynamicContentPath
)

export default {
  // ? The env Property: https://nuxtjs.org/api/configuration-env/
  env: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.URL || 'http://createADotEnvFileAndSetURL'
        : 'http://localhost:3000',
    lang: SITE_INFO.sitelang || 'en-US'
  },
  server: {
    host: '0',
    port: '3000' // optional
  },
  /*
   ** Headers of the page
   */
  head: {
    title: SITE_INFO.sitename || process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: SITE_INFO.sitedescription || process.env.npm_package_description || ''
      }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,400;0,700;1,400&display=swap'
      },
      {
        rel: 'preload',
        href: '/fonts/hauora_sans/fonts/web/Hauora-Regular.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: true
      },
      {
        rel: 'preload',
        href: '/fonts/hauora_sans/fonts/web/Hauora-Regular.woff',
        as: 'font',
        type: 'font/woff',
        crossorigin: true
      },
      {
        rel: 'preload',
        href: '/fonts/hauora_sans/fonts/web/Hauora-SemiBold.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: true
      },
      {
        rel: 'preload',
        href: '/fonts/hauora_sans/fonts/web/Hauora-SemiBold.woff',
        as: 'font',
        type: 'font/woff',
        crossorigin: true
      },
    ] // ? Imports the font 'Karla' and is optimized by the netlify plugin 'Subfont'
  },
  generate: {
    routes: dynamicRoutes,
    fallback: true,
    subFolders: false
  },
  render: {
    bundleRenderer: {
      shouldPreload: (file, type) => {
        return ['script', 'style', 'font'].includes(type)
      }
    }
  },
  /*
   ** Customize the progress-bar color
   */
  loading: false,
  /*
   ** Global CSS
   */
  css: ['@/assets/css/tailwind.css', '@/assets/css/main.pcss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/color-mode', '@nuxtjs/tailwindcss', '@nuxtjs/svg', '@nuxtjs/pwa'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/markdownit',
    'nuxt-purgecss',
    '@nuxtjs/i18n',
  ],
  markdownit: {
    injected: true
  },
  i18n: {
    locales: ['en', 'be'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: { en, be }

    }
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [
      'three',
      'three-spritetext'
    ],
    extractCSS: true,
    postcss: {
      plugins: {
        'postcss-import': postcssImport,
        tailwindcss: path.resolve(__dirname, './tailwind.config.js'),
        'postcss-nesting': postcssNesting,
        'postcss-preset-env': postcssPresetEnv({
          stage: 1,
          features: {
            'nesting-rules': false
          }
        })
      }
    },
    /*
     ** You can extend webpack config here
     */
    extend(config) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      })
    },
  },
  /*
   ** Custom additions configuration
   */
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    exposeConfig: false // enables `import { theme } from '~tailwind.config'`
  },
  purgeCSS: {
    mode: 'postcss',
    whitelist: ['dark-mode', 'light-mode', 'btn', 'icon', 'main'],
    whitelistPatterns: [/^article/, /image$/]
  },
  colorMode: {
    preference: 'light', // default value of $colorMode.preference
    fallback: COLOR_MODE_FALLBACK, // fallback value if not system preference found
    componentName: 'ColorScheme',
    cookie: {
      options: {
        sameSite: 'lax'
      }
    }
  },
  pwa: {
    icon: {
      source: 'static/icon.png',
      filename: 'icon.png'
    },
    manifest: { name: SITE_INFO.sitename || process.env.npm_package_name || '', lang: process.env.lang },
    meta: {
      name: SITE_INFO.sitename || process.env.npm_package_name || '',
      lang: process.env.lang,
      ogHost: process.env.URL,
      ogImage: '/ogp.jpg'
    }
  }
}

/**
 * Create an array of URLs from a list of files
 * @param {*} urlFilepathTable - example below
 * {
 *   blog: 'blog/*.json',
 *   connections: 'connections/*.json'
 * }
 *
 * @return {Array} - Will return those files into urls for SSR generated .html's like
 * [
 *   /blog/2019-08-27-incidunt-laborum-e ,
 *   /connections/example-name
 * ]
 */
function getDynamicPaths(urlFilepathTable, cwdPath) {
  console.log('Going to generate dynamicRoutes for these collection types: ', urlFilepathTable)
  const dynamicPaths = [].concat(
    ...Object.keys(urlFilepathTable).map(url => {
      const filepathGlob = urlFilepathTable[url]
      return glob.sync(filepathGlob, { cwd: cwdPath }).map(filepath => {
        return `/${url}/${path.basename(filepath, '.json')}`
      })
    })
  )
  console.log('Found these dynamicPaths that will be SSR generated:', dynamicPaths)
  return dynamicPaths
}
