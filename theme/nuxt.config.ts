import { defineNuxtConfig } from 'nuxt3'
import { resolve } from 'pathe'

const modulePath = resolve(__dirname, '../src/index')

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: ['@unocss/nuxt', modulePath],
  // Docs: https://github.com/antfu/unocss
  // @ts-ignore
  unocss: {
    uno: true,
    icons: true,
    preflight: true,
    shortcuts: {
      // Container
      'd-max-w-container': 'max-w-7xl',
      'd-container-padded': 'px-4 sm:px-6',
      'd-container': 'd-max-w-container mx-auto',
      'd-container-content': 'd-container d-container-padded',
      'd-header-blur': 'backdrop-blur-12',
      'd-header-bg': 'bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80',
      'd-header': 'sticky w-full top-0 z-50 d-header-blur h-header',
      'd-text-secondary': 'text-gray-500 dark:text-gray-200',
      'd-text-secondary-hover': 'text-primary-500 dark:text-primary-400',
      'd-sticky-footer-container': 'flex flex-col min-h-screen'
    },
    rules: [],
    theme: {
      colors: {
        // emerald
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        }
      },
      height: {
        header: '4rem',
        '(screen-header)': 'calc(100vh - 4rem)'
      },
      maxWidth: {
        readable: '740px'
      }
      // height: theme => ({
      //   '(full-18)': `calc(100% - ${theme('spacing.18')})`,
      //   '(full-header)': `calc(100% - ${theme('spacing.header')})`,
      //   '(screen-18)': `calc(100vh - ${theme('spacing.18')})`,
      //   '(screen-header)': `calc(100vh - ${theme('spacing.header')})`,
      //   '(screen-36)': `calc(100vh - ${theme('spacing.36')})`,
      //   '(screen-46)': `calc(100vh - ${theme('spacing.46')})`
      // }),
      // maxHeight: theme => ({
      //   '(screen-18)': `calc(100vh - ${theme('spacing.18')})`,
      //   '(screen-header)': `calc(100vh - ${theme('spacing.header')})`
      // }),
      // minHeight: () => ({
      //   'fill-available': '-webkit-fill-available'
      // }),
    }
  },
  components: [
    {
      path: resolve(__dirname, 'components/header'),
      prefix: '',
      isAsync: false,
      level: 2
    },
    {
      path: resolve(__dirname, 'components/footer'),
      prefix: '',
      isAsync: false,
      level: 2
    },
    {
      path: resolve(__dirname, 'components/aside'),
      prefix: '',
      isAsync: false,
      level: 2
    },
    {
      path: resolve(__dirname, 'components/content'),
      prefix: '',
      isAsync: false,
      level: 2
    },
    {
      path: resolve(__dirname, 'components/icons'),
      prefix: '',
      isAsync: false,
      level: 2
    },
    {
      path: resolve(__dirname, 'components/prose'),
      prefix: 'Prose',
      isAsync: false,
      level: 0
    }
  ]
})
