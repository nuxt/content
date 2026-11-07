import { rmSync } from 'node:fs'
import MyModule from '../../../src/module'
import { sourceDir } from './source-dir'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  nitro: {
    // Vercel Build Output: public files go to the CDN, everything else to one function.
    preset: 'vercel',
    // As for an installed module: Nitro doesn't auto-import in files under `node_modules`.
    imports: { exclude: [/\/src\/runtime\//] },
  },
  hooks: {
    'nitro:init'(nitro) {
      // From here on, content can only come from the build output.
      nitro.hooks.hook('prerender:done', () => rmSync(sourceDir, { recursive: true, force: true }))
    },
  },
})
