import { resolve } from 'node:path'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    alias: {
      '#content/manifest': resolve('./test/mock/content-manifest.ts'),
    },
    include: ['test/**/*.test.ts'],
    exclude: [
      './test/bun.test.ts',
      '**/.data/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },
})
