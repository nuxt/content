import type { ModuleOptions, Nuxt } from '@nuxt/schema'

export interface Manifest {
  integrityVersion: string
  dump: string[]
  components: string[]
}

export interface Preset {
  setup: (options: ModuleOptions, nuxt: Nuxt, manifest: Manifest) => void
}

export function definePreset(preset: Preset) {
  return preset
}
