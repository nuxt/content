import type { ModuleOptions } from '@nuxt/schema'
import type { NitroConfig } from 'nitropack'
import type { Manifest } from '../types/manifest'

export interface Preset {
  setupNitro: (options: ModuleOptions, nitroConfig: NitroConfig, manifest: Manifest) => void | Promise<void>
}

export function definePreset(preset: Preset) {
  return preset
}
