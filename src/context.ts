import { createContext } from 'unctx'
import remarkComponentsPlugin from './transformers/markdown/components'
import propsHandler from './transformers/markdown/components/props'
import { DocusContext } from './types/Context'

const ctx = createContext<DocusContext>()

ctx.set({
  locales: {
    codes: ['en'],
    defaultLocale: 'en'
  },
  dir: {
    components: []
  },
  search: {
    inheritanceFields: ['layout'],
    fields: ['description', 'date', 'imgUrl']
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
        { instance: remarkComponentsPlugin, name: 'components' },
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
