import defu from 'defu'
import remarkEmoji from 'remark-emoji'
import rehypeSlug from 'rehype-slug'
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import rehypeSortAttributeValues from 'rehype-sort-attribute-values'
import rehypeSortAttributes from 'rehype-sort-attributes'
import rehypeRaw from 'rehype-raw'
import { MarkdownOptions, Toc } from '../types'
import { setTagsMap } from './utils'
import { processHeading } from './meta'
import { parseFrontMatter } from './frontmatter'
import { generateToc } from './toc'
import { generateBody } from './content'

export const useDefaultOptions = (): MarkdownOptions => ({
  mdc: true,
  toc: {
    depth: 2,
    searchDepth: 2
  },
  tags: {
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
  },
  remarkPlugins: [
    remarkEmoji,
    remarkSqueezeParagraphs,
    remarkGfm
  ],
  rehypePlugins: [
    rehypeSlug,
    rehypeExternalLinks,
    rehypeSortAttributeValues,
    rehypeSortAttributes,
    [rehypeRaw, { passThrough: ['element'] }]
  ]
})

export async function parse (file: string, userOptions: Partial<MarkdownOptions> = {}) {
  const options = defu(userOptions, useDefaultOptions()) as MarkdownOptions
  setTagsMap(options.tags)

  const { content, data, ...rest } = await parseFrontMatter(file)

  // Compile markdown from file content to JSON
  const body = await generateBody(content, { ...options, data })

  /**
   * generate toc if it is not disabled in front-matter
   */
  let toc: Toc | undefined
  if (data.toc !== false) {
    const tocOption = defu(data.toc || {}, options.toc)
    toc = generateToc(body, tocOption)
  }

  let excerpt
  if (rest.excerpt) {
    excerpt = await generateBody(rest.excerpt, { ...options, data })
  }

  /**
   * Process content headeings
   */
  const heading = processHeading(body, options)

  return {
    body: {
      ...body,
      toc
    },
    meta: {
      empty: content.trim().length === 0,
      title: heading.title,
      description: heading.description,
      excerpt,
      ...data
    }
  }
}

export * from './frontmatter'
