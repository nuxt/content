import { readFile } from 'node:fs/promises'
import { join } from 'pathe'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { glob } from 'tinyglobby'
import type { CollectionSource, GitCollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadRepository, getLocalGitInfo, parseBitBucketUrl, parseGitHubUrl, shallowCloneRepository } from './git'
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

export function defineGitSource(source: GitCollectionSource): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({ rootDir }) => {
    const repository = source?.repository && await getLocalGitInfo(source.repository!)

    // Only registers if the `cloneRepository` option is true
    if (repository && source.cloneRepository) {
      const { name, source: provider } = repository
      const formattedProvider = provider.split('.')[0]
      // check branch & remote owner/name to use in the `cwd` folder name?
      resolvedSource.cwd = join(rootDir, '.data', 'content', `${formattedProvider}-${name}-clone`)

      let revision = 'HEAD'
      if (source.gitRef) {
        if (source.gitRef.branch) revision = `refs/heads/${source.gitRef.branch}`
        if (source.gitRef.tag) revision = `refs/tags/${source.gitRef.tag}`
      }

      const url = source.repository!
      await shallowCloneRepository(url, resolvedSource.cwd, revision)
    }
  }

  return resolvedSource
}

export function defineGitHubSource(source: GitCollectionSource): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({ rootDir }) => {
    const repository = source?.repository && parseGitHubUrl(source.repository!)
    // Only download if `cloneRepository` is set to false / undefined.
    if (repository && !source.cloneRepository) {
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
  source: GitCollectionSource,
): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({ rootDir }) => {
    const repository
      = source?.repository && parseBitBucketUrl(source.repository!)
      // Only download if `cloneRepository` is set to false / undefined.
    if (repository && !source.cloneRepository) {
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
