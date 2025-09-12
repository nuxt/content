import { readFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { join, normalize } from 'pathe'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { glob } from 'tinyglobby'
import type { CollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadRepository, parseBitBucketUrl, parseGitHubUrl } from './git'
import { logger } from './dev'

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

export function defineGitHubSource(source: CollectionSource): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({ rootDir }) => {
    const repository = source?.repository && parseGitHubUrl(source.repository!)
    if (repository) {
      const { org, repo, branch } = repository
      resolvedSource.cwd = join(rootDir, '.data', 'content', `github-${org}-${repo}-${branch}`)

      let headers: Record<string, string> = {}
      if (resolvedSource.authToken) {
        headers = { Authorization: `Bearer ${resolvedSource.authToken}` }
      }

      const url = headers.Authorization
        ? `https://api.github.com/repos/${org}/${repo}/tarball/${branch}`
        : `https://github.com/${org}/${repo}/archive/refs/heads/${branch}.tar.gz`

      await downloadRepository(url, resolvedSource.cwd!, { headers })
    }
  }

  return resolvedSource
}

export function defineBitbucketSource(
  source: CollectionSource,
): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({ rootDir }) => {
    const repository
      = source?.repository && parseBitBucketUrl(source.repository!)
    if (repository) {
      const { org, repo, branch } = repository
      resolvedSource.cwd = join(
        rootDir,
        '.data',
        'content',
        `bitbucket-${org}-${repo}-${branch}`,
      )

      let headers: Record<string, string> = {}
      if (resolvedSource.authBasic) {
        const credentials = `${resolvedSource.authBasic.username}:${resolvedSource.authBasic.password}`
        const encodedCredentials = btoa(credentials)
        headers = {
          Authorization: `Basic ${encodedCredentials}`,
        }
      }

      const url = `https://bitbucket.org/${org}/${repo}/get/${branch}.tar.gz`

      await downloadRepository(url, resolvedSource.cwd!, { headers })
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
        createReadStream(join(resolvedSource.cwd, fixed, keys[0]!))
          .on('data', function (chunk) {
            for (let i = 0; i < chunk.length; i += 1)
              if (chunk[i] == 10) {
                csvKeys.push(`${keys[0]}#l${count}`)
                count += 1
              }
          })
          .on('end', () => resolve(csvKeys))
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
