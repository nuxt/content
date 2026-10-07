import type { H3Event } from 'h3'
import type { Nitro, NitroConfig, NitroRouteRules } from 'nitropack'

/**
 * @nuxt/module-builder typechecks this module without the app-layer Nitro augment
 * (`.nuxt/nuxt.node.d.ts`). That leaves `NitroTypes` empty, so Nuxt 4.6 resolves
 * `nitro:config` to `NitroConfigFallback`, which lacks the keys this module writes.
 * Declare the installed nitropack builder so the hook stays typed as `NitroConfig`.
 */
interface InstalledNitroTypes {
  instance: Nitro
  config: NitroConfig
}

declare module '@nuxt/schema' {
  interface NitroTypes extends InstalledNitroTypes {}

  interface NuxtOptions {
    nitro: NitroConfig
    routeRules: Record<string, NitroRouteRules>
  }

  interface NuxtHooks {
    'nitro:config': (config: NitroConfig) => void | Promise<void>
  }

  interface RuntimeConfig {
    content?: {
      database?: {
        type?: string
      }
    }
  }

  interface ServerTypes {
    event: H3Event
  }
}

declare module 'nuxt/schema' {
  interface NitroTypes extends InstalledNitroTypes {}

  interface NuxtOptions {
    nitro: NitroConfig
    routeRules: Record<string, NitroRouteRules>
  }

  interface NuxtHooks {
    'nitro:config': (config: NitroConfig) => void | Promise<void>
  }

  interface RuntimeConfig {
    content?: {
      database?: {
        type?: string
      }
    }
  }

  interface ServerTypes {
    event: H3Event
  }
}

export {}
