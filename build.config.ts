import { BuildOptions } from 'unbuild'

export default <BuildOptions>{
  entries: [
    './src/index',
    './src/module',
    './src/node',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' },
    { input: 'src/templates/', outDir: 'dist/templates', format: 'esm', ext: 'js', declaration: false }
  ],
  declaration: true,
  externals: ['micromark', 'ufo', 'consola', 'vue-meta']
}
