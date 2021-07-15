import { pascalCase } from 'scule'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'

export function generatePosition(path: string): string {
  const position = path
    .split('/')
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
       * remove index keyword
       */
      .replace(/^index/, '')
      /**
       * remove draft keyword
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
