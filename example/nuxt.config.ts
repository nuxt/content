import { resolve } from 'path'
import { withDocus } from '@docus/app'

// Get local theme path
const themePath = resolve(__dirname, './theme/index.ts')

export default withDocus(themePath, {
  components: [
    {
      path: resolve(__dirname, 'components'),
      prefix: '',
      isAsync: false,
      level: 2
    }
  ],
  rootDir: __dirname,
  // @ts-ignore
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  },
  buildModules: ['@nuxt/typescript-build', '../src']
})
