import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { resolve, dirname } from 'pathe'

export const r = (...paths: string[]) => resolve(typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname, ...paths)

export default defineConfig({
  resolve: {
    alias: [
      { find: '#storage', replacement: r('./test/mocks/storage.ts') },
      { find: '#query-plugins', replacement: r('./test/fixtures/basic/.nuxt/query-plugins.mjs') },
      { find: '#content-plugins', replacement: r('./test/fixtures/basic/.nuxt/content-plugins.mjs') },
      { find: '#config', replacement: r('./test/mocks/config.ts') }
    ]
  }
})
