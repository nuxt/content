import { createHash } from 'node:crypto'
import { fake } from 'forges/fake'

const guide = '# Guide\n\nRead it first.\n\nWritten at d1.'
const alert = '# New\n\n::live-alert\nOnly since d3.\n::'
const fr = '# Docs en français'

/** Files of each commit, by repository. `c2` changes no content. */
const commits: Record<string, Record<string, Record<string, string>>> = {
  'acme/site': {
    s1: { 'content/index.md': '# Home at s1', 'content/about.md': '# About' },
    s2: { 'content/index.md': '# Home at s2', 'content/about.md': '# About' },
    s3: { 'content/index.md': '# Home at s3', 'content/about.md': '# About' },
  },
  'acme/docs': {
    d1: { 'docs/index.md': '# Docs at d1', 'docs/guide.md': guide, 'docs/old.md': '# Old', 'fr/index.md': fr, 'README.md': 'v1' },
    c2: { 'docs/index.md': '# Docs at d1', 'docs/guide.md': guide, 'docs/old.md': '# Old', 'fr/index.md': fr, 'README.md': 'v2' },
    d3: { 'docs/index.md': '# Docs at d3', 'docs/guide.md': guide, 'docs/new.md': alert, 'fr/index.md': fr, 'README.md': 'v2' },
    d4: { 'docs/index.md': '# Docs at d3', 'docs/guide.md': guide.replace('at d1', 'at d4'), 'docs/new.md': alert, 'fr/index.md': fr, 'README.md': 'v2' },
  },
}

/** Head commit of each repository, moved by `/api/push`. */
export const heads: Record<string, string> = { 'acme/site': 's1', 'acme/docs': process.env.LIVE_DOCS_HEAD || 'd1' }

/** What was asked of the forge and how it answers, read and set by `/api/forge`. */
export const forgeState = {
  /** One entry per request, such as `tree acme/docs@d1`, `commits acme/docs:docs` or `head acme/site`. */
  asked: [] as string[],
  online: process.env.LIVE_FORGE !== 'offline',
  /** Repository whose `live.ref` function fails. */
  down: process.env.LIVE_DOWN || '',
  /** Milliseconds `head()` takes. */
  slow: 0,
}
// Expose the copies the module imports, to check it asks nothing of the forge.
if (import.meta.prerender === undefined) {
  ((globalThis as { __liveModuleForge?: typeof forgeState[] }).__liveModuleForge ||= []).push(forgeState)
}

const fakeForge = fake({
  seed: {
    repos: Object.keys(commits).map(repo => ({ repo })),
    files: Object.entries(commits).flatMap(([repo, shas]) => Object.entries(shas).flatMap(([ref, files]) =>
      Object.entries(files).map(([path, content]) => ({ repo, ref, path, content })))),
  },
})

const slug = (repo: { owner: string, name: string }) => `${repo.owner}/${repo.name}`
/** Resolve a ref to a commit, a branch being at its head. */
const commitOf = (repo: string, ref: string) => commits[repo]![ref] ? ref : heads[repo]!
const offline = () => new Error('The forge is offline.')
const gitBlobId = (content: string) => createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0${content}`).digest('hex')

/** Fake forge that answers as GitHub where `forges/fake` differs: blob IDs in trees, and `commits.list()` on a directory. */
export const provider = new Proxy(fakeForge, {
  get: (target, key) => {
    if (key === 'contents') {
      return {
        ...target.contents,
        getFile: async (repo: any, path: string, options: any) => {
          forgeState.asked.push(`file ${slug(repo)}@${options.ref}:${path}`)
          if (!forgeState.online) throw offline()
          return target.contents.getFile(repo, path, { ...options, ref: commitOf(slug(repo), options.ref) })
        },
        tree: (repo: any, options: any) => {
          forgeState.asked.push(`tree ${slug(repo)}@${options.ref}`)
          const files = commits[slug(repo)]![commitOf(slug(repo), options.ref)]!
          const entries = Object.entries(files)
            .filter(([path]) => !options.path || path.startsWith(`${options.path}/`))
            .map(([path, content]) => ({ path, type: 'file', sha: gitBlobId(content) }))
          return Object.assign((async function* () {
            if (!forgeState.online) throw offline()
            yield* entries
          })(), { warnings: [] })
        },
      }
    }
    if (key === 'commits') {
      return {
        list: (repo: any, query: { ref?: string, path?: string }) => ({
          page: async () => {
            forgeState.asked.push(`commits ${slug(repo)}:${query.path}`)
            if (!forgeState.online || forgeState.down === slug(repo)) throw offline()
            // Commits of the branch, newest first.
            const shas = Object.keys(commits[slug(repo)]!)
            const history = shas.slice(0, shas.indexOf(heads[slug(repo)]!) + 1).reverse()
            const files = (sha: string) => JSON.stringify(Object.entries(commits[slug(repo)]![sha] ?? {}).filter(([path]) => !query.path || path.startsWith(`${query.path}/`)))
            // Keep the commits whose files under `path` differ from their parent's.
            const touching = history.filter((sha, index) => files(sha) !== files(history[index + 1] ?? ''))
            return { items: touching.map(sha => ({ sha })) }
          },
        }),
      }
    }
    return Reflect.get(target, key)
  },
})

/** Return a `live.ref` function: the head of `repo`. */
export function head(repo: string) {
  return async () => {
    forgeState.asked.push(`head ${repo}`)
    if (!forgeState.online || forgeState.down === repo) throw offline()
    // Read the head before the delay, as a forge answers.
    const commit = heads[repo]!
    if (forgeState.slow) await new Promise(resolve => setTimeout(resolve, forgeState.slow))
    return commit
  }
}
