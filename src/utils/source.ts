import { join } from 'pathe'
import type { CollectionSource, ResolvedCollectionSource } from '../types/collection'
import { downloadRepository, parseGitHubUrl } from './git'

export function defineLocalSource(source: CollectionSource): ResolvedCollectionSource {
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    ...source,
    cwd: '',
    prepare: async (nuxt) => {
      resolvedSource.cwd = source.cwd || join(nuxt.options.rootDir, 'content')
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

        await downloadRepository(
          `https://github.com/${org}/${repo}/archive/refs/heads/${branch}.tar.gz`,
          resolvedSource.cwd!,
        )
      }
    },
  }
  return resolvedSource
}
