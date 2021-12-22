import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 2000,
    setupFiles: ['./test/setup.ts']
  }
})
