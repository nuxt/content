import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'
import pkg from '../package.json'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  app: {
    rootAttrs: {
      'vaul-drawer-wrapper': '',
      'class': 'bg-[--ui-bg]',
    },
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxthub/core',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
  ],

  content: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
  },

  hub: {
    database: true,
    cache: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },

  icon: {
    customCollections: [{
      prefix: 'custom',
      dir: resolve('./app/assets/icons'),
    }],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    provider: 'iconify',
  },

  image: {
    provider: 'ipx',
  },

  routeRules: {
    '/': { redirect: '/getting-started', prerender: false },
  },

  hooks: {
    'components:extend': (components) => {
      const globals = components.filter(c => [
        'UAccordion',
        'UAlert',
        'UAvatar',
        'UAvatarGroup',
        'UBadge',
        'UBreadcrumb',
        'UButton',
        'UButtonGroup',
        'UCheckbox',
        'UChip',
        'UCollapsible',
        'UCommandPalette',
        'UContextMenu',
        'UDrawer',
        'UDropdownMenu',
        'UFormField',
        'UIcon',
        'UInput',
        'UInputMenu',
        'UKbd',
        'ULink',
        'UModal',
        'UNavigationMenu',
        'UPagination',
        'UPopover',
        'UProgress',
        'URadioGroup',
        'USelect',
        'USelectMenu',
        'USeparator',
        'USlider',
        'USlideover',
        'USwitch',
        'UTabs',
        'UTextarea',
        'UTooltip',
      ].includes(c.pascalName))

      globals.forEach(c => c.global = 'sync')
    },
  },

  site: {
    url: 'https://content3.nuxt.dev',
  },

  compatibilityDate: '2024-07-09',
})
