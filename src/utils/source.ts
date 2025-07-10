import { readFile } from 'node:fs/promises'
import { join } from 'pathe'
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
  const { fixed } = parseSourceBase(source)
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
    prepare: async ({ rootDir }) => {
      resolvedSource.cwd = source.cwd
        ? String(source.cwd).replace(/^~~\//, rootDir)
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

export function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.include.includes('*') ? source.include.split('*') : ['', source.include]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}
