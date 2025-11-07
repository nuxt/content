import { readFile } from 'node:fs/promises'
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
        const { source: gitSource, owner, name } = repository
        resolvedSource.cwd = join(rootDir, '.data', 'content', `${gitSource}-${owner}-${name}-${repository.ref || 'main'}`)

        await downloadGitRepository(source.repository!, resolvedSource.cwd!)
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

        if (source.repository.auth) {
          await downloadGitRepository(source.repository.url!, resolvedSource.cwd!, source.repository.auth, ref)
        }
        else {
          await downloadGitRepository(source.repository.url!, resolvedSource.cwd!, undefined, ref)
        }
      }
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
