import { pascalCase } from 'scule'
import slugify from 'slugify'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'
import { ParsedContentMeta } from '../../types'
import { useRuntimeConfig } from '#imports'

const SEMVER_REGEX = /^(\d+)(\.\d+)*(\.x)?$/

const describeId = (_id: string) => {
  const [_source, ...parts] = _id.split(':')

  const [, filename, _extension] = parts[parts.length - 1].match(/(.*)\.([^.]+)$/)
  parts[parts.length - 1] = filename
  const _path = parts.join('/')

  return <Pick<ParsedContentMeta, '_source' | '_path' | '_extension' | '_file'>> {
    _source,
    _path,
    _extension,
    _file: _extension ? `${_path}.${_extension}` : _path
  }
}

export default {
  name: 'path-meta',
  extensions: ['.*'],
  transform (content) {
    const { locales, defaultLocale } = useRuntimeConfig().content || {}
    const { _source, _file, _path, _extension } = describeId(content._id)
    const parts = _path.split('/')

    // Check first part for locale name
    const _locale = locales.includes(parts[0]) ? parts.shift() : defaultLocale

    const filePath = parts.join('/')

    return <ParsedContentMeta> {
      _path: generatePath(filePath),
      _draft: isDraft(filePath),
      _partial: isPartial(filePath),
      _locale,
      ...content,
      // TODO: move title to Markdown parser
      title: content.title || generateTitle(refineUrlPart(parts[parts.length - 1])),
      _source,
      _file,
      _extension
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
