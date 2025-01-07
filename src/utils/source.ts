import { readFile } from 'node:fs/promises'
import { join } from 'pathe'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import FastGlob from 'fast-glob'
import type { CollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadRepository, parseGitHubUrl } from './git'

export function defineLocalSource(source: CollectionSource | ResolvedCollectionSource): ResolvedCollectionSource {
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
      const _keys = await FastGlob(source.include, { cwd: resolvedSource.cwd, ignore: source!.exclude || [], dot: true })
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

export function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.include.includes('*') ? source.include.split('*') : ['', source.include]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}
