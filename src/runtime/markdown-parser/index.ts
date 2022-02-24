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
import { parseFrontMatter } from './frontmatter'
import { generateToc } from './toc'
import { contentHeading, generateBody } from './content'

export const useDefaultOptions = (): MarkdownOptions => ({
  mdc: true,
  toc: {
    depth: 2,
    searchDepth: 2
  },
  tags: {},
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
   * Process content headings
   */
  const heading = contentHeading(body)

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
