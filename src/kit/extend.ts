import { mergeHooks } from 'hookable'
import defu from 'defu'
import type { NuxtConfig } from '@nuxt/types'

export function mergeConfig(target: NuxtConfig, base: NuxtConfig): NuxtConfig {
  // Custom merges
  const override: NuxtConfig = {}

  // Merge hooks
  override.hooks = mergeHooks(base.hooks || {}, target.hooks || {})

  // Merge components
  if (base.components || target.components) {
    override.components = [...normalizeComponents(target.components), ...normalizeComponents(base.components, true)]
  }

  // Mege with defu
  return { ...defu.arrayFn(target, base), ...override }
}

function normalizeComponents(components: NuxtConfig['components'], isBase?: boolean) {
  if (typeof components === 'boolean' || !components) components = []

  if (!Array.isArray(components)) {
    // TODO: Deprecate components: { dirs } support from @nuxt/components
    throw new TypeError('`components` should be an array: ' + typeof components)
  }

  const componentsArr = components.map(dir => ({
    ...(typeof dir === 'string' ? { path: dir } : dir)
  }))

  for (const component of componentsArr) component.level = (component.level || 0) + (isBase ? 1 : 0)

  return componentsArr
}
