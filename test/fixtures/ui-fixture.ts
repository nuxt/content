import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Setup options for the `ui` fixture, extending `ui-layer` copied into its `node_modules`,
 * so the layer's components have a `/node_modules/` path as when it's installed from npm.
 */
export function uiFixture() {
  const rootDir = fileURLToPath(new URL('./ui', import.meta.url))
  const layerDir = `${rootDir}/node_modules/ui-layer`
  cpSync(fileURLToPath(new URL('./ui-layer', import.meta.url)), layerDir, { recursive: true })
  return { rootDir, nuxtConfig: { extends: [layerDir] } }
}
