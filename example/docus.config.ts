import { resolve } from 'pathe'
import { defineDocusConfig } from '../src'

export default defineDocusConfig({
  title: 'Example',
  theme: resolve(__dirname, 'theme'),
  template: 'page'
})
