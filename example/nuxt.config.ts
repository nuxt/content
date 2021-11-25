import { resolve } from 'pathe'
import { withDocus } from '../src'

const config = withDocus({
  alias: {
    docus: resolve(__dirname, '../src')
  },
  rootDir: resolve(__dirname)
})

export default config
