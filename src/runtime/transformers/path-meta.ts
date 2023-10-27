import { pascalCase } from 'scule'
import slugify from 'slugify'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'
import type { ParsedContent } from '../types'
import { defineTransformer } from './utils'

const SEMVER_REGEX = /^(\d+)(\.\d+)*(\.x)?$/

export const describeId = (id: string) => {
  const [_source, ...parts] = id.split(':')

  const [, filename, _extension] = parts[parts.length - 1]?.match(/(.*)\.([^.]+)$/) || []

  if (filename) {
    parts[parts.length - 1] = filename
  }

  const _path = (parts || []).join('/')

  return {
    _source,
    _path,
    _extension,
    _file: _extension ? `${_path}.${_extension}` : _path
  }
}

export default defineTransformer({
  name: 'path-meta',
  extensions: ['.*'],
  transform (content, options: any = {}) {
    const { locales = [], defaultLocale = 'en', respectPathCase = false } = options
    const { _source, _file, _path, _extension } = describeId(content._id)
    const parts = _path.split('/')
    // Check first part for locale name
    const _locale = locales.includes(parts[0]) ? parts.shift() : defaultLocale
    const filePath = generatePath(parts.join('/'), { respectPathCase })

    return <ParsedContent> {
      _path: filePath,
      _dir: filePath.split('/').slice(-2)[0],
      _draft: content._draft ?? isDraft(_path),
      _partial: isPartial(_path),
      _locale,
      ...content,
      // TODO: move title to Markdown parser
      title: content.title || generateTitle(refineUrlPart(parts[parts.length - 1])),
      _source,
      _file,
      _extension
    }
  }
})

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
export const generatePath = (path: string, { forceLeadingSlash = true, respectPathCase = false } = {}): string => {
  path = path.split('/').map(part => slugify(refineUrlPart(part), { lower: !respectPathCase })).join('/')
  return forceLeadingSlash ? withLeadingSlash(withoutTrailingSlash(path)) : path
}

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
      .replace(/^index(\.draft)?$/, '')
      /**
       * Remove draft keyword
       */
      .replace(/\.draft$/, '')
  )
}
