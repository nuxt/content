import MyModule from '../../../src/module'

export default defineNuxtConfig({
  // Ships `app/content.worker.ts`, as Docus would.
  extends: ['./search-layer'],
  modules: [
    MyModule,
  ],
  // As for an installed module: Nuxt doesn't auto-import in files under `node_modules`.
  imports: { transform: { exclude: [/[\\/]src[\\/]runtime[\\/]/] } },
  content: {
    compatibilityVersion: 4,
    mode: 'server-only',
  },
  nitro: {
    // Only `.output/public`, served without a server.
    preset: 'static',
    imports: { exclude: [/\/src\/runtime\//] },
  },
})
