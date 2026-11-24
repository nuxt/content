import MyModule from '../../../src/module'

export default defineNuxtConfig({
  extends: ['./docs-layer'],
  modules: [
    MyModule,
  ],
  content: {
    compatibilityVersion: 4,
    mode: 'server-only',
  },
  nitro: {
    // Vercel Build Output: public files go to the CDN, everything else to one function.
    preset: 'vercel',
    // As for an installed module: Nitro doesn't auto-import in files under `node_modules`.
    imports: { exclude: [/\/src\/runtime\//] },
    prerender: { routes: ['/en', '/en/docs/getting-started', '/fr/guide'] },
  },
})
