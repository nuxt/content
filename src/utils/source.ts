import { join } from 'pathe'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { CollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadRepository, parseGitHubUrl } from './git'

export function defineLocalSource(source: CollectionSource): ResolvedCollectionSource {
  const { fixed } = parseSourceBase(source)
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
    ...source,
    include: source.include,
    cwd: '',
    prepare: async (nuxt) => {
      resolvedSource.cwd = source.cwd
        ? String(source.cwd).replace(/^~~\//, nuxt.options.rootDir)
        : join(nuxt.options.rootDir, 'content')
    },
  }
  return resolvedSource
}

export function defineGitHubSource(source: CollectionSource): ResolvedCollectionSource {
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    ...source,
    cwd: '',
    prepare: async (nuxt) => {
      const repository = source?.repository && parseGitHubUrl(source.repository!)
      if (repository) {
        const { org, repo, branch } = repository
        resolvedSource.cwd = join(nuxt.options.rootDir, '.data', 'content', `github-${org}-${repo}-${branch}`)

        let headers: Record<string, string> = {}
        if (resolvedSource.authToken) {
          headers = { Authorization: `Bearer ${resolvedSource.authToken}` }
        }

        const url = headers.Authorization
          ? `https://api.github.com/repos/${org}/${repo}/tarball/${branch}`
          : `https://github.com/${org}/${repo}/archive/refs/heads/${branch}.tar.gz`

        await downloadRepository(url, resolvedSource.cwd!, { headers })
      }
    },
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
