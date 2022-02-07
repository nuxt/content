import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { resolve, dirname } from 'pathe'

export const __dir = resolve(typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname)

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '#config',
        replacement: path.resolve(__dir, './mocks/config.ts')
      },
      {
        find: '#content',
        replacement: path.resolve(__dir, './mocks/content.ts')
      },
      {
        find: '#storage',
        replacement: path.resolve(__dir, './mocks/storage.ts')
      },
      {
        find: '#query-plugins',
        replacement: path.resolve(__dir, './mocks/query-plugins.ts')
      },
      {
        find: '#content-plugins',
        replacement: path.resolve(__dir, './mocks/content-plugins.ts')
      }
    ]
  }
})
