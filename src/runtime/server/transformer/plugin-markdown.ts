import { parse } from '@docus/mdc'
import { defineContentPlugin } from '../../'

export default defineContentPlugin({
  name: 'mdc',
  extentions: ['.md'],
  parse: async (id, content) => {
    const parsed = await parse(content, {
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
        p: 'prose-p',
        strong: 'prose-strong',
        table: 'prose-table',
        tbody: 'prose-tbody',
        td: 'prose-td',
        th: 'prose-th',
        thead: 'prose-thead',
        tr: 'prose-tr',
        ul: 'prose-ul'
      }
    })

    return {
      meta: {
        id,
        type: 'markdown',
        ...parsed.meta
      },
      body: parsed.body
    }
  }
})
