import type { NitroConfig } from 'nitropack'
import type { Resolver } from '@nuxt/kit'
import type { Manifest } from '../types/manifest'

interface Options {
  manifest: Manifest
  resolver: Resolver
}
export interface Preset {
  setupNitro: (nitroConfig: NitroConfig, opts: Options) => void | Promise<void>
}

export function definePreset(preset: Preset) {
  return preset
}
