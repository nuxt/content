import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index',
      name: 'index',
      format: 'esm'
    },
    {
      input: 'src/runtime/index',
      name: 'runtime/index',
      format: 'esm'
    }
  ],
  externals: ['nuxt3', '@nuxt/kit']
})
