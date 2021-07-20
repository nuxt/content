import defu from 'defu'
import { Toc } from '../../types'
import { generateBody } from './content'
import { generateToc } from './toc'
import { parseFrontMatter } from './fontmatter'
import { useDocusContext } from './../../context'
import {
  processHeading,
  generatePosition,
  generateSlug,
  generateTitleFromSlug,
  generateTo,
  isDraft,
  isHidden
} from './meta'

function getPathMeta(id: string) {
  const context = useDocusContext()!
  const { codes = [], defaultLocale = 'en' } = context.locales
  const regexp = new RegExp(`^/(${codes.join('|')})`, 'gi')
  const paths = id
    // remove extension
    .split('.')
    .slice(0, -1)
    .join('.')
    // Remove mount point
    // This should be improved
    .split(/:/g)
    .slice(1)

  let path = paths.join('/')
  const [language] = path.match(regexp) || []
  if (language) {
    path = path.replace(regexp, '')
  }
  const slug = generateSlug(paths[paths.length - 1])

  return {
    slug,
    title: generateTitleFromSlug(slug),
    position: generatePosition(path),
    to: generateTo(path),
    draft: isDraft(path),
    page: !isHidden(path),
    language: language || defaultLocale
  }
}

export default async function markdown(id: string, file: string) {
  const options = useDocusContext()!.transformers.markdown
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
  const heading = processHeading(body)

  const pathMeta = getPathMeta(id)

  return {
    body: {
      raw: file,
      ast: body,
      toc
    },
    meta: {
      ...pathMeta,
      ...data,
      empty: content.trim().length === 0,
      title: data.title || heading.title || pathMeta.title,
      description: data.description || heading.description,
      excerpt
    }
  }
}
