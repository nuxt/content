import { resolve } from 'path'
import { withDocus } from '@docus/app'

// Get local theme path
const themePath = resolve(__dirname, './theme/index.ts')

export default withDocus(themePath, {
  rootDir: __dirname,
  // @ts-ignore
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  }
})
