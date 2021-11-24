import { resolve } from 'pathe'
import { withDocus } from '../src'

const config = withDocus({
  rootDir: resolve(__dirname)
})

export default config
