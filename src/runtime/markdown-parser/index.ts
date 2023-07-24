// eslint-disable-next-line import/no-named-as-default
import defu from 'defu'
import remarkEmoji from 'remark-emoji'
import rehypeSlug from 'rehype-slug'
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import rehypeSortAttributeValues from 'rehype-sort-attribute-values'
import rehypeSortAttributes from 'rehype-sort-attributes'
import rehypeRaw from 'rehype-raw'
import { parseFrontMatter } from 'remark-mdc'
import { MarkdownOptions, MarkdownParsedContent, Toc } from '../types'
import { generateToc } from './toc'
import { contentHeading, generateBody } from './content'

export const useDefaultOptions = (): MarkdownOptions => ({
  mdc: true,
  toc: {
    depth: 2,
    searchDepth: 2
  },
  tags: {},
  remarkPlugins: {
    'remark-emoji': {
      instance: remarkEmoji
    },
    'remark-squeeze-paragraphs': {
      instance: remarkSqueezeParagraphs
    },
    'remark-gfm': {
      instance: remarkGfm
    }
  },
  rehypePlugins: {
    'rehype-slug': {
      instance: rehypeSlug
    },
    'rehype-external-links': {
      instance: rehypeExternalLinks
    },
    'rehype-sort-attribute-values': {
      instance: rehypeSortAttributeValues
    },
    'rehype-sort-attributes': {
      instance: rehypeSortAttributes
    },
    'rehype-raw': {
      instance: rehypeRaw,
      options: {
        passThrough: ['element']
      }
    }
  }
})

export async function parse (file: string, userOptions: Partial<MarkdownOptions> = {}) {
  const options = defu(userOptions, useDefaultOptions()) as MarkdownOptions

  const { content, data } = parseFrontMatter(file)

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

  const excerptString = useExcerpt(content)
  const excerpt = excerptString
    ? await generateBody(excerptString, { ...options, data })
    : undefined

  /**
   * Process content headings
   */
  const heading = contentHeading(body)

  return <{ meta: Partial<MarkdownParsedContent>, body: MarkdownParsedContent['body'] }> {
    body: {
      ...body,
      toc
    },
    meta: {
      _empty: content.trim().length === 0,
      title: heading.title,
      description: heading.description,
      excerpt,
      ...data
    }
  }
}

function useExcerpt (content: string, delimiter = /<!--\s*?more\s*?-->/i) {
  if (!delimiter) {
    return ''
  }
  // if enabled, get the excerpt defined after front-matter
  let idx = -1
  const match = delimiter.exec(content)
  if (match) {
    idx = match.index
  }
  if (idx !== -1) {
    return content.slice(0, idx)
  }
}
