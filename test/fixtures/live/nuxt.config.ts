import MyModule from '../../../src/module'

export default defineNuxtConfig({
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
    // Vercel Build Output: public files go to the CDN, everything else to one function.
    preset: 'vercel',
    // As for an installed module: Nitro doesn't auto-import in files under `node_modules`.
    imports: { exclude: [/\/src\/runtime\//] },
  },
})
