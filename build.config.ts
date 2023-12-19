import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/runtime/',
      outDir: 'dist/runtime',
      ext: 'js'
    }
  ]
})
