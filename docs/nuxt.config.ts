import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'
import pkg from '../package.json'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({

  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxthub/core',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
  ],
  app: {
    rootAttrs: {
      'vaul-drawer-wrapper': '',
      'class': 'bg-[--ui-bg]',
    },
  },

  site: {
    url: 'https://content3.nuxt.dev',
  },

  content: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
  },

  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },

  routeRules: {
    '/': { redirect: '/getting-started', prerender: false },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-07-09',

  hub: {
    database: true,
    cache: true,
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
})
