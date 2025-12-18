import { readFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { join, normalize } from 'pathe'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { glob } from 'tinyglobby'
import type { CollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadGitRepository } from './git'
import { logger } from './dev'
import gitUrlParse from 'git-url-parse'

export function getExcludedSourcePaths(source: CollectionSource) {
  return [
    ...(source!.exclude || []),
    // Ignore OS files
    '**/.DS_Store',
  ]
}

export function defineLocalSource(source: CollectionSource | ResolvedCollectionSource): ResolvedCollectionSource {
  if (source.include.startsWith('./') || source.include.startsWith('../')) {
    logger.warn('Collection source should not start with `./` or `../`.')
    source.include = source.include.replace(/^(\.\/|\.\.\/|\/)*/, '')
  }

  // If source is a CSV file, define a CSV source
  if (source.include.endsWith('.csv') && !source.include.includes('*')) {
    return defineCSVSource(source)
  }

  const { fixed } = parseSourceBase(source)
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
    prepare: async ({ rootDir }) => {
      resolvedSource.cwd = source.cwd
        ? String(normalize(source.cwd)).replace(/^~~\//, rootDir)
        : join(rootDir, 'content')
    },
    getKeys: async () => {
      const _keys = await glob(source.include, { cwd: resolvedSource.cwd, ignore: getExcludedSourcePaths(source), dot: true, expandDirectories: false })
        .catch((): [] => [])
      return _keys.map(key => key.substring(fixed.length))
    },
    getItem: async (key) => {
      const fullPath = join(resolvedSource.cwd, fixed, key)
      const content = await readFile(fullPath, 'utf8')
      return content
    },
    ...source,
    include: source.include,
    cwd: '',
  }
  return resolvedSource
}

export function defineGitSource(source: CollectionSource): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)
  resolvedSource.prepare = async ({ rootDir }) => {
    if (typeof (source.repository) === 'string') {
      const repository = source?.repository && gitUrlParse(source.repository)
      if (repository) {
        const { protocol, host, full_name, ref } = repository
        source = {
          ...source,
          repository: {
            url: `${protocol}://${host}/${full_name}`,
            branch: ref || 'main',
          },
        }
      }
    }

    if (typeof (source.repository) === 'object') {
      const repository = source?.repository && gitUrlParse(source.repository.url)
      if (repository) {
        const { source: gitSource, owner, name } = repository
        resolvedSource.cwd = join(rootDir, '.data', 'content', `${gitSource}-${owner}-${name}-${repository.ref || 'main'}`)

        let ref: object | undefined

        if (source.repository.branch && source.repository.tag) {
          throw new Error('Cannot specify both branch and tag for git repository. Please specify one of `branch` or `tag`.')
        }

        if (source.repository.branch) ref = { branch: source.repository.branch }
        if (source.repository.tag) ref = { tag: source.repository.tag }

        if (!source.repository?.auth && source.authBasic) {
          source.repository.auth = {
            username: source.authBasic.username,
            password: source.authBasic.password,
          }
        }
        if (!source.repository?.auth && source.authToken) {
          source.repository.auth = {
            token: source.authToken,
          }
        }

        await downloadGitRepository(source.repository.url!, resolvedSource.cwd!, source.repository.auth, ref)
      }
    }
  }
  return resolvedSource
}

export function defineCSVSource(source: CollectionSource): ResolvedCollectionSource {
  const { fixed } = parseSourceBase(source)

  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
    prepare: async ({ rootDir }) => {
      resolvedSource.cwd = source.cwd
        ? String(normalize(source.cwd)).replace(/^~~\//, rootDir)
        : join(rootDir, 'content')
    },
    getKeys: async () => {
      const _keys = await glob(source.include, { cwd: resolvedSource.cwd, ignore: getExcludedSourcePaths(source), dot: true, expandDirectories: false })
        .catch((): [] => [])
      const keys = _keys.map(key => key.substring(fixed.length))
      if (keys.length !== 1) {
        return keys
      }

      return new Promise((resolve) => {
        const csvKeys: string[] = []
        let count = 0
        let lastByteWasNewline = true
        createReadStream(join(resolvedSource.cwd, fixed, keys[0]!))
          .on('data', function (chunk) {
            for (let i = 0; i < chunk.length; i += 1) {
              if (chunk[i] == 10) {
                if (count > 0) { // count === 0 is CSV header row and should not be included
                  csvKeys.push(`${keys[0]}#${count}`)
                }
                count += 1
              }
              lastByteWasNewline = chunk[i] == 10
            }
          })
          .on('end', () => {
            // If file doesn't end with newline and we have at least one data row, add the last row
            if (!lastByteWasNewline && count > 0) {
              csvKeys.push(`${keys[0]}#${count}`)
            }
            resolve(csvKeys)
          })
      })
    },
    getItem: async (key) => {
      const [csvKey, csvIndex] = key.split('#')
      const fullPath = join(resolvedSource.cwd, fixed, csvKey!)
      const content = await readFile(fullPath, 'utf8')

      if (key.includes('#')) {
        const lines = content.split('\n')
        return lines[0] + '\n' + lines[+(csvIndex || 0)]!
      }

      return content
    },
    ...source,
    include: source.include,
    cwd: '',
  }
  return resolvedSource
}

export function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.include.includes('*') ? source.include.split('*') : ['', source.include]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}
