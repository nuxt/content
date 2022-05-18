import { pascalCase } from 'scule'
import slugify from 'slugify'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'
import { useRuntimeConfig } from '#imports'

const SEMVER_REGEX = /^(\d+)(\.\d+)*(\.x)?$/

const describeId = ($id: string) => {
  const [$source, ...parts] = $id.split(':')

  const [, filename, $extension] = parts[parts.length - 1].match(/(.*)\.([^.]+)$/)
  parts[parts.length - 1] = filename
  const $path = parts.join('/')

  return {
    $source,
    $path,
    $extension,
    $file: $extension ? `${$path}.${$extension}` : $path
  }
}

export default {
  name: 'path-meta',
  extentions: ['.*'],
  transform (content) {
    const { locales, defaultLocale } = useRuntimeConfig().content || {}
    const { $source, $file, $path, $extension } = describeId(content.$id)
    const parts = $path.split('/')

    // Check first part for locale name
    const $locale = locales.includes(parts[0]) ? parts.shift() : defaultLocale

    const filePath = parts.join('/')

    return {
      $path: generatePath(filePath),
      $draft: isDraft(filePath),
      $partial: isPartial(filePath),
      $locale,
      ...content,
      // TODO: move title to Markdown parser
      title: content.title || generateTitle(refineUrlPart(parts[parts.length - 1])),
      $source,
      $file,
      $extension
    }
  }
}

/**
 * When file name ends with `.draft` then it will mark as draft.
 */
const isDraft = (path: string): boolean => !!path.match(/\.draft(\/|\.|$)/)

/**
 * Files or directories that starts with underscore `_` will mark as partial content.
 */
const isPartial = (path: string): boolean => path.split(/[:/]/).some(part => part.match(/^_.*/))

/**
 * Generate path from file name
 *
 * @param path file full path
 * @returns generated slug
 */
const generatePath = (path: string): string =>
  withLeadingSlash(withoutTrailingSlash(path.split('/').map(part => slugify(refineUrlPart(part), { lower: true })).join('/')))

/**
 * generate title from file path
 */
export const generateTitle = (path: string) => path.split(/[\s-]/g).map(pascalCase).join(' ')

/**
 * Clean up special keywords from path part
 */
export function refineUrlPart (name: string): string {
  name = name.split(/[/:]/).pop()!
  // Match 1, 1.2, 1.x, 1.2.x, 1.2.3.x,
  if (SEMVER_REGEX.test(name)) {
    return name
  }
  return (
    name
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
