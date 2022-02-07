import markdownPlugin from '../../src/markdown/runtime/plugin-markdown.js'
import pathMetaPlugin from '../../src/runtime/server/transformer/plugin-path-meta.js'
import { benchmark, describe } from './utils.js'

const markdowns = [
  ['frontmatter', '---\nid: content:index.md\ntitle: Index\ndraft: false\n---\n'],
  ['h1', '# Index'],
  ['h2', '## Index'],
  ['paragraph', 'This is a paragraph'],
  ['code', "```js\nconst foo = 'bar'\n```"],
  ['link', '[link](https://docus.dev)'],
  ['ul', '- Item 1\n- Item 2\n- Item 3\n  - Item 3.1\n   - Item 3.1'],
  ['component', '::component\n\nThis is a paragraph\n\n::'],
  ['inline-component', ':component{.class #id prop="value"}'],
  ['quote', '> This is a quote\n>\n> This is a quote\n>\n> This is a quote']
]

describe('Path Meta Transformer', () => {
  benchmark(
    'Extract Meta',
    async () =>
      await pathMetaPlugin.transform({
        meta: { id: 'content:index.md' },
        body: {}
      })
  )
})
describe('Markdown Parser', () => {
  markdowns.forEach(([tag, body]) => {
    benchmark('Parse ' + tag, async () => await markdownPlugin.parse('content:index.md', body))
  })
})
