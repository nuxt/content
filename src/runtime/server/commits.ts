// No Nuxt import, so this file can move to comark-content.
import type { Manifest } from 'comark-content'
import type { ForgeSource } from 'comark-content/sources/forge'
import type { RepoRef } from 'forges'

/**
 * Return a `live.ref` function: the last commit that touched `path` on `ref`.
 * Takes the options of `forge()`.
 *
 * @example
 * ```ts
 * const docs = { provider: github(), repo: 'acme/docs', ref: 'main', path: 'content' }
 * createNuxtContent({ mode: 'server-only', source: forge(docs), live: { ref: lastCommit(docs) } })
 * ```
 */
export function lastCommit(options: ForgeSource): () => Promise<string> {
  const { provider, ref } = options
  const path = (options.path ?? '').replace(/^\/+|\/+$/g, '')
  const repo = typeof options.repo === 'string' ? toRepoRef(provider, options.repo) : options.repo
  return async () => {
    const { items } = await provider.commits.list(repo, { ref, path: path || undefined, perPage: 1 }).page()
    const commit = items[0]
    if (!commit) {
      throw new Error(`lastCommit: no commit touches \`${path || '/'}\` on \`${ref ?? 'the default branch'}\` of \`${repo.owner}/${repo.name}\`.`)
    }
    return commit.sha
  }
}

// Parse `owner/name` as `forge()` does, nested GitLab groups included.
function toRepoRef(provider: ForgeSource['provider'], slug: string): RepoRef {
  const parts = slug.replace(/^\/+|\/+$/g, '').split('/')
  if (parts.length < 2) throw new Error(`lastCommit: repo must be "owner/name", got "${slug}".`)
  return { forge: provider.forge, instance: provider.instance, owner: parts.slice(0, -1).join('/'), name: parts.at(-1)! }
}

/** What changed in a source between two commits. */
export interface CommitComparison {
  /** Paths of documents added or whose source changed. */
  changed: string[]
  /** Paths of documents that no longer exist. */
  removed: string[]
  /** Whether a path was added or removed, or a listing field changed. */
  navigation: boolean
}

/** Compare the manifests of a source at two commits. Without `before`, every document changed. */
export function compareManifests(before: Manifest | undefined, after: Manifest): CommitComparison {
  const documents = (manifest: Manifest | undefined) => new Map(Object.values(manifest?.items ?? {})
    .filter(item => item.meta.kind === 'document')
    .map(item => [item.path, item]))
  const from = documents(before)
  const to = documents(after)
  // Count a document without a hash as changed.
  const changed = [...to].filter(([path, item]) => !item.meta.hash || from.get(path)?.meta.hash !== item.meta.hash).map(([path]) => path).sort()
  const removed = [...from.keys()].filter(path => !to.has(path)).sort()
  const navigation = !before || removed.length > 0 || [...to].some(([path, item]) => !from.has(path) || JSON.stringify(from.get(path)!.data) !== JSON.stringify(item.data))
  return { changed, removed, navigation }
}
