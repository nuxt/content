import { resolveModule } from '@nuxt/kit'
import { DocusContext } from './types'

export const defaultContext: DocusContext = {
  locales: {
    codes: ['en'],
    defaultLocale: 'en'
  },
  database: {
    provider: 'lokijs',
    options: {}
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
      components: [],
      remarkPlugins: [
        {
          name: resolveModule('./runtime/transformers/markdown/components', { paths: __dirname }),
          configKey: 'components'
        },
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
}
