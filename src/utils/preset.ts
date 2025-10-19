import type { Nitro } from 'nitropack'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../types/module'
import type { Manifest } from '../types/manifest'

interface Options {
  manifest: Manifest
  resolver: Resolver
  moduleOptions: ModuleOptions
  nuxt: Nuxt
}
export interface Preset {
  name: string
  parent?: Preset
  setup?: (options: ModuleOptions, nuxt: Nuxt) => Promise<void> | void
  setupNitro: (nitro: Nitro, opts: Options) => void | Promise<void>
}

export function definePreset(preset: Preset) {
  const _preset: Preset = {
    ...preset,
    setup: async (options, nuxt) => {
      if (preset.parent) {
        await preset.parent.setup?.(options, nuxt)
      }
      await preset.setup?.(options, nuxt)
    },
    setupNitro: async (nitro, opts) => {
      if (preset.parent) {
        await preset.parent.setupNitro?.(nitro, opts)
      }
      await preset.setupNitro?.(nitro, opts)
    },
  }
  return _preset
}
