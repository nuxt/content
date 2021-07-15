import { createContext } from 'unctx'
import directive from './parser/markdown/directive'
import remarkComponentsPlugin from './parser/markdown/directive/components'
import propsHandler from './parser/markdown/directive/props'

const ctx = createContext()

ctx.set({
  locales: {
    codes: ['en'],
    defaultLocale: 'en'
  },
  transformers: {
    markdown: {
      toc: {
        depth: 2,
        searchDepth: 2
      },
      components: {
        props: propsHandler
      },
      remarkPlugins: [
        { instance: directive, name: 'directive' },
        { instance: remarkComponentsPlugin, name: 'components', key: 'components' },
        'remark-emoji',
        'remark-squeeze-paragraphs',
        'remark-slug',
        ['remark-autolink-headings', { behavior: 'wrap' }],
        'remark-external-links',
        'remark-footnotes',
        'remark-gfm'
      ],
      rehypePlugins: ['rehype-sort-attribute-values', 'rehype-sort-attributes', 'rehype-raw']
    }
  }
})

export const useDocusContext = ctx.use
