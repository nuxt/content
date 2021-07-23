import { BuildOptions } from 'unbuild'

export default <BuildOptions>{
  entries: [
    { input: 'src/index' },
    { input: 'src/runtime' },
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' },
    { input: 'src/templates/', outDir: 'dist/templates', format: 'esm', ext: 'js', declaration: false }
  ],
  declaration: true,
  externals: [
    'ufo',
    'consola',
    'vue-meta',
    'vue',
    'micromark',
    '@nuxtjs/composition-api',
    'micromark/dist/character/markdown-line-ending',
    'micromark/dist/character/ascii-alpha',
    'micromark/dist/character/ascii-alphanumeric',
    'micromark/dist/character/markdown-line-ending-or-space',
    'micromark/dist/character/markdown-space',
    'micromark/dist/tokenize/factory-whitespace',
    'micromark/dist/tokenize/factory-space',
    'micromark/dist/util/size-chunks',
    'micromark/dist/tokenize/code-fenced.js',
    'micromark/dist/util/prefix-size'
  ]
}
