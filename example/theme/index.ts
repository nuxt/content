import { resolve } from 'path'

const r = (...args: string[]) => resolve(__dirname, ...args)

export default {
  themeName: 'exampleTheme',
  themeDir: __dirname,
  components: [
    {
      path: r('./components'),
      prefix: '',
      global: true,
      level: 2
    }
  ]
}
