import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { resolve, dirname } from 'pathe'

export const __dir = resolve(typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname)

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '#docus-query-plugins',
        replacement: path.resolve(__dir, './mocks/docus-query-plugins.ts')
      },
      {
        find: '#docus-content-plugins',
        replacement: path.resolve(__dir, './mocks/docus-content-plugins.ts')
      }
    ]
  }
})
