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
      components: [],
      rehypePlugins: [],
      remarkPlugins: [],
      tagMap: {
        a: 'prose-a',
        blockquote: 'prose-blockquote',
        'code-inline': 'prose-code-inline',
        code: 'prose-code',
        em: 'prose-em',
        h1: 'prose-h1',
        h2: 'prose-h2',
        h3: 'prose-h3',
        h4: 'prose-h4',
        h5: 'prose-h5',
        h6: 'prose-h6',
        hr: 'prose-hr',
        img: 'prose-img',
        li: 'prose-li',
        ol: 'prose-ol',
        p: 'prose-paragraph',
        strong: 'prose-strong',
        table: 'prose-table',
        tbody: 'prose-tbody',
        tf: 'prose-tf',
        th: 'prose-th',
        thead: 'prose-thead',
        tr: 'prose-tr',
        ul: 'prose-ul'
      }
    }
  }
}
