import { pascalCase } from 'scule'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'

export function generatePosition(path: string): string {
  const position = path
    .split(/[/:]/)
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^(\d+)\./)
      if (match) {
        return padLeft(match[1], 4)
      }
      return '9999' // Parts without a position are going down to the bottom
    })
    .join('')
  return padRight(position, 12)
}

/**
 * Clean up special keywords from path part
 */
export function generateSlug(name: string): string {
  return (
    name
      /**
       * Remove hidden keyword
       */
      .replace(/^_/, '')
      /**
       * Remove numbering
       */
      .replace(/(\d+\.)?(.*)/, '$2')
      /**
       * Remove index keyword
       */
      .replace(/^index/, '')
      /**
       * Remove draft keyword
       */
      .replace(/\.draft/, '')
  )
}

export function generateTitleFromSlug(slug: string) {
  return slug.split(/[\s-]/g).map(pascalCase).join(' ')
}

export function generateTo(path: string): string {
  return withLeadingSlash(withoutTrailingSlash(path.split('/').map(generateSlug).join('/')))
}

export function isDraft(path: string): boolean {
  return !!path.match(/\.draft(\/|\.|$)/)
}

/**
 * Files or directories that starts with underscore `_` will mark as hidden
 * @param path content path
 * @returns true if the is part in the path that starts with `_`
 */
export function isHidden(path: string): boolean {
  return path.split('/').some(part => part.match(/^_.*/))
}

function padLeft(value: string, length: number): string {
  return ('0'.repeat(length) + value).substr(String(value).length)
}

function padRight(value: string, length: number): string {
  return (value + '0'.repeat(length)).substr(0, length)
}

export function getPathMeta(id: string, { locales = ['en'], defaultLocale = 'en' } = {}) {
  const regexp = new RegExp(`^/?(${locales.join('|')})`, 'gi')
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
