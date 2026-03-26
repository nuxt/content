import type { NitroConfig, NitroRouteRules } from 'nitropack'

declare module '@nuxt/schema' {
  interface NuxtOptions {
    nitro: NitroConfig
    routeRules: Record<string, NitroRouteRules>
  }

  interface NuxtHooks {
    'nitro:config': (config: NitroConfig) => void | Promise<void>
  }
}

declare module 'nuxt/schema' {
  interface NuxtOptions {
    nitro: NitroConfig
    routeRules: Record<string, NitroRouteRules>
  }

  interface NuxtHooks {
    'nitro:config': (config: NitroConfig) => void | Promise<void>
  }
}

export {}
