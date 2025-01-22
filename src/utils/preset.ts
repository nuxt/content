import type { NitroConfig } from 'nitropack'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../types/module'
import type { Manifest } from '../types/manifest'

interface Options {
  manifest: Manifest
  resolver: Resolver
  moduleOptions: ModuleOptions
}
export interface Preset {
  name: string
  setupNitro: (nitroConfig: NitroConfig, opts: Options) => void | Promise<void>
}

export function definePreset(preset: Preset) {
  return preset
}
