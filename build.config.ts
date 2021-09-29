import { BuildOptions } from 'unbuild'

export default <BuildOptions>{
  entries: [
    { input: 'src/index' },
    { input: 'src/runtime' },
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' },
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'cjs', declaration: false },
    { input: 'src/templates/', outDir: 'dist/templates', declaration: false }
  ],
  declaration: true,
  externals: ['#config', '#storage', 'vue-meta', 'vue']
}
