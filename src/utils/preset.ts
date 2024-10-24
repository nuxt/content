import type { ModuleOptions, Nuxt } from '@nuxt/schema'

export interface Manifest {
  integrityVersion: string
  dump: string[]
  components: string[]
}

export interface Preset {
  defaults: (nuxt: Nuxt) => Partial<ModuleOptions>
  setup: (options: ModuleOptions, nuxt: Nuxt, manifest: Manifest) => void
}

export function definePreset(preset: Preset) {
  return preset
}
