import { pascalCase } from 'scule'
import slugify from 'slugify'
import { withoutTrailingSlash, withLeadingSlash } from 'ufo'
import defu from 'defu'
import type { PathMetaOptions } from '../../../types/path-meta'
import { defineTransformer } from './utils'

const SEMVER_REGEX = /^\d+(?:\.\d+)*(?:\.x)?$/

const defaultOptions: PathMetaOptions = {
  slugifyOptions: {
    lower: true,
  },
}

export default defineTransformer({
  name: 'path-meta',
  extensions: ['.*'],
  transform(content, options: PathMetaOptions = {}) {
    const opts = defu(options, defaultOptions)
    const { basename, extension, stem } = describeId(content.id)
    // Check first part for locale name
    const filePath = generatePath(stem, opts)

    return {
      path: filePath,
      ...content,
      title: content.title || generateTitle(refineUrlPart(basename)),
      stem,
      extension,
    }
  },
})

/**
 * Generate path from file name
 *
 * @param path file full path
 * @returns generated slug
 */
export const generatePath = (path: string, { forceLeadingSlash = true, slugifyOptions = {} } = {}): string => {
  path = path.split('/').map(part => slugify(refineUrlPart(part), slugifyOptions)).join('/')
  return forceLeadingSlash ? withLeadingSlash(withoutTrailingSlash(path)) : path
}

/**
 * generate title from file path
 */
export const generateTitle = (path: string) => path.split(/[\s-]/g).map(pascalCase).join(' ')

/**
 * Clean up special keywords from path part
 */
export function refineUrlPart(name: string): string {
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

export const describeId = (id: string) => {
  const [source, ...parts] = id.split(/[:/]/)

  const [, basename, extension] = parts[parts.length - 1]?.match(/(.*)\.([^.]+)$/) || []

  if (basename) {
    parts[parts.length - 1] = basename
  }

  const stem = (parts || []).join('/')

  return {
    source,
    stem,
    extension,
    basename: basename || '',
  }
}
