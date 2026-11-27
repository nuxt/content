import { contentHub, readArtifact, type AnyComarkContent, type CacheArtifact, type CacheDriver, type CacheOptions, type ContentHub, type Manifest } from 'comark-content'
import { compareManifests, type CommitComparison } from './commits'

type ContentInstance = AnyComarkContent
type ContentSurface = ContentInstance | ContentHub<any>

/** Return the commit to serve. */
export type LiveRef = () => string | Promise<string>

export interface LiveOptions {
  /** One function for every source, or one per source name. */
  ref: LiveRef | Record<string, LiveRef>
  /** Seconds the stored commits are served before the functions are called again. Without it, every request calls them. */
  maxAge?: number
}

/** What changed in a source, from `revalidateContent()`. */
export interface ContentRevalidation extends CommitComparison {
  /** Commit served before, `null` when none was stored. */
  from: string | null
  /** Commit served from now on. */
  to: string
}

/** Commit of each source, by source name. */
type Commits = Record<string, string>

interface StoredCommits {
  /** When the functions were called, in milliseconds. */
  time: number
  commits: Commits
}

interface AskedCommits extends StoredCommits {
  /** Functions that failed, with the sources they pin. */
  failed: { names: string[], error: Error }[]
}

interface LiveState {
  /** Each `live.ref` function, with the sources it pins. */
  refs: { ref: LiveRef, names: string[] }[]
  maxAge?: number
  /** Call in progress, shared by the requests waiting for it. */
  asking?: Promise<AskedCommits>
  /** Sources whose function failed on the last call. */
  failing: Set<string>
  /** Whether the app passes a `cache.driver`. */
  sharedCache: boolean
  /** The app's `cache.driver`, or this server's memory. */
  driver: Pick<CacheDriver, 'getItem' | 'setItem'>
  /** Commit the build snapshot of a source is stamped with. */
  buildCommit: (name: string) => Promise<string | undefined>
  /** Pinned instances of each source: the served one, then the one before. */
  pinned: Map<string, ContentInstance[]>
  /** Hub of the served instances. */
  hub?: ContentHub<any>
}

// Shared with the module, which imports its own copy of this file.
const LIVE = Symbol.for('nuxt-content:live')
// Instance names have no `-`, so the key can't collide with theirs.
const COMMITS_KEY = 'live-commits'

const isHub = (content: ContentSurface): content is ContentHub<any> => Array.isArray((content as ContentHub).names)
const liveState = (content: ContentSurface) => (content as { [LIVE]?: LiveState })[LIVE]
const sourceNames = (content: ContentSurface): string[] => isHub(content) ? [...content.names] : [content.name]

/** Validate `live` and attach its state to `content`. */
export function setupLive(content: ContentSurface, options: LiveOptions, { cache, loadManifest }: {
  cache: CacheOptions | false | undefined
  /** Load the manifest of a source's build snapshot. */
  loadManifest: (name: string) => Promise<CacheArtifact | null>
}) {
  const instances: ContentInstance[] = isHub(content) ? [...content.instances] : [content]
  const names = instances.map(instance => instance.name)
  // `fs()` and `unstorage()` have no `withRef()`.
  const unpinnable = instances.filter(instance => typeof instance.getSource()?.withRef !== 'function').map(instance => instance.name)
  if (unpinnable.length) {
    throw new Error(`createNuxtContent: \`live\` needs sources that can be pinned to a commit, such as \`forge()\` or a source with \`withRef()\`. ${unpinnable.map(name => `\`${name}\``).join(', ')} can't.`)
  }
  const { ref } = options
  const missing = typeof ref === 'function' ? [] : names.filter(name => typeof ref?.[name] !== 'function')
  if (!ref || missing.length) {
    throw new Error(`createNuxtContent: \`live.ref\` needs a function returning the commit to serve${missing.length ? `, and has none for ${missing.map(name => `\`${name}\``).join(', ')}` : ''}.`)
  }
  const refs = typeof ref === 'function' ? [{ ref, names }] : names.map(name => ({ ref: ref[name]!, names: [name] }))
  let memory: string | undefined
  // Keep the build's commits out of the driver the servers read.
  const driver = (!import.meta.prerender && cache && cache.driver) || { getItem: () => memory, setItem: (_key: string, value: string) => void (memory = value) }
  const buildCommits = new Map<string, Promise<string | undefined>>()
  const buildCommit = (name: string) => buildCommits.get(name) ?? buildCommits.set(name, loadManifest(name)
    .then(async artifact => artifact ? (await readArtifact<Manifest>(artifact)).ref : undefined)
    .catch(() => undefined)).get(name)!
  Object.defineProperty(content, LIVE, { value: { refs, maxAge: options.maxAge, failing: new Set(), sharedCache: Boolean(cache && cache.driver), driver, buildCommit, pinned: new Map() } satisfies LiveState })
}

/** Return the content pinned to the commits being served. A content that isn't live, or any content in dev, is returned as is. */
export function resolveContent<T extends ContentSurface>(content: T): Promise<T> {
  return resolveContentFor(content)
}

/**
 * `resolveContent()` for the module's handler, where a build snapshot route only needs the commit of `source`.
 * @internal
 */
export async function resolveContentFor<T extends ContentSurface>(content: T, source?: string): Promise<T> {
  const state = liveState(content)
  if (!state || import.meta.dev) return content
  return contentAt(content, state, await servedCommits(content, state, source)) as T
}

/** Return the stored commits, or call the functions once they're older than `maxAge`. */
async function servedCommits(content: ContentSurface, state: LiveState, source?: string): Promise<Commits> {
  let asked: AskedCommits
  if (import.meta.prerender) {
    // Call once per build, so every snapshot is stamped from the same call.
    asked = await (state.asking ||= askCommits(state, undefined))
  }
  else {
    const stored = await readCommits(state)
    if (stored && state.maxAge && Date.now() - stored.time < state.maxAge * 1000 && sourceNames(content).every(name => stored.commits[name])) {
      return stored.commits
    }
    // Share the call with the requests arriving meanwhile.
    asked = await (state.asking ||= askCommits(state, stored).finally(() => state.asking = undefined))
  }
  const { commits, failed } = asked
  const failing = new Set(failed.flatMap(({ names }) => names))
  for (const { names, error } of failed) {
    const missing = names.filter(name => !commits[name] && (!source || name === source))
    if (missing.length) throw new Error(`[@nuxt/content] The \`live.ref\` function of \`${missing.join('`, `')}\` failed, and no commit is stored to serve instead: ${error.message}`, { cause: error })
    // Warn once per outage.
    if (names.some(name => commits[name] && !state.failing.has(name))) console.warn(`[@nuxt/content] The \`live.ref\` function of \`${names.join('`, `')}\` failed, serving \`${commits[names[0]!]}\`:`, error.message)
  }
  state.failing = failing
  return commits
}

/**
 * Call every `live.ref` function, store the commits and return what changed.
 * Returns one result for a `source`, or one per source whose commit moved for `sources`.
 * Throws when a function failed, after storing the commits of the others.
 */
export async function revalidateContent(content: ContentInstance): Promise<ContentRevalidation>
export async function revalidateContent(content: ContentHub<any>): Promise<Record<string, ContentRevalidation>>
export async function revalidateContent(content: ContentSurface): Promise<ContentRevalidation | Record<string, ContentRevalidation>>
export async function revalidateContent(content: ContentSurface): Promise<ContentRevalidation | Record<string, ContentRevalidation>> {
  const state = liveState(content)
  if (!state) throw new Error('revalidateContent: this content has no `live` option.')
  if (import.meta.dev) throw new Error('revalidateContent: in dev, a live content is read from its source as it is. There is no commit to move.')

  const stored = await readCommits(state)
  const { commits, failed } = await askCommits(state, stored)
  if (failed.length) {
    throw new Error(`revalidateContent: the \`live.ref\` function of ${failed.map(({ names }) => names.map(name => `\`${name}\``).join(', ')).join(', ')} failed: ${failed.map(({ error }) => error.message).join(' ')}`, { cause: failed[0]!.error })
  }
  const next = contentAt(content, state, commits)

  const results: Record<string, ContentRevalidation> = {}
  await Promise.all(sourceNames(content).map(async (name) => {
    const from = stored?.commits[name] ?? null
    const to = commits[name]!
    if (from === to && isHub(content)) return
    const instance = isHub(next) ? next.from(name) : next
    const before = from && from !== to ? await manifestAt(isHub(content) ? content.from(name) : content, state, from) : undefined
    results[name] = { from, to, ...(from === to ? { changed: [], removed: [], navigation: false } : compareManifests(before, await instance.manifest())) }
  }))
  return isHub(content) ? results : results[content.name]!
}

async function readCommits(state: LiveState): Promise<StoredCommits | undefined> {
  try {
    const value = await state.driver.getItem(COMMITS_KEY, {})
    // Drivers return the stored string, or parsed JSON.
    const stored = (typeof value === 'string' ? JSON.parse(value) : value) as StoredCommits | null | undefined
    return stored && typeof stored.time === 'number' && stored.commits ? stored : undefined
  }
  catch {
    // Treat an unreadable entry as missing.
    return undefined
  }
}

/** Call every `live.ref` function and store the commits. A failed source keeps its stored commit, or its build snapshot's. */
async function askCommits(state: LiveState, stored: StoredCommits | undefined): Promise<AskedCommits> {
  const time = Date.now()
  const commits: Commits = {}
  const failed: AskedCommits['failed'] = []
  await Promise.all(state.refs.map(async ({ ref, names }) => {
    try {
      const commit = await ref()
      if (typeof commit !== 'string' || !commit) throw new Error('`live.ref` returned no commit.')
      for (const name of names) commits[name] = commit
    }
    catch (error) {
      failed.push({ names, error: error as Error })
      for (const name of names) {
        const commit = stored?.commits[name] ?? await state.buildCommit(name)
        if (commit) commits[name] = commit
      }
    }
  }))
  // Keep the commits of a call that started later, such as a webhook's.
  const latest = await readCommits(state)
  if (latest && latest.time > time) return { ...latest, failed: [] }
  await state.driver.setItem?.(COMMITS_KEY, JSON.stringify({ time, commits } satisfies StoredCommits), {})
  return { time, commits, failed }
}

/** Pin each source of `content` to its commit. */
function contentAt(content: ContentSurface, state: LiveState, commits: Commits): ContentSurface {
  if (!isHub(content)) return instanceAt(content, state, commits[content.name]!)
  // A source without a commit stays unpinned, which only happens on a build snapshot route of another source.
  const instances = content.names.map((name: string) => commits[name] ? instanceAt(content.from(name), state, commits[name]) : content.from(name))
  // Reuse the hub while no instance changed.
  if (!state.hub || instances.some((instance, index) => instance !== state.hub!.instances[index])) {
    state.hub = contentHub(instances, { basePath: content.basePath })
  }
  return state.hub
}

/** Return the instance of a source at `commit`. Keeps the previous one for requests in flight and releases older ones. */
function instanceAt(instance: ContentInstance, state: LiveState, commit: string): ContentInstance {
  const [current, previous] = state.pinned.get(instance.name) ?? []
  if (current?.ref === commit) return current
  // Reuse the previous instance when going back to its commit.
  const next = previous?.ref === commit ? previous : instance.withRef(commit)
  state.pinned.set(instance.name, current ? [next, current] : [next])
  if (previous && previous !== next) {
    release(previous, state).catch(error => console.warn(`[@nuxt/content] Could not release \`${instance.name}\` at \`${previous.ref}\`:`, (error as Error).message))
  }
  return next
}

/** Dispose an instance, and delete what it stored unless other servers share the driver. */
async function release(instance: ContentInstance, state: LiveState) {
  if (state.sharedCache) await instance.dispose()
  else await instance.clean()
}

/** Return the manifest of a source at a commit served before. */
async function manifestAt(instance: ContentInstance, state: LiveState, commit: string) {
  const pinned = state.pinned.get(instance.name)?.find(({ ref }) => ref === commit)
  if (pinned) return await pinned.manifest()
  // Served by another server: read it from the shared driver.
  const other = instance.withRef(commit)
  try {
    return await other.manifest()
  }
  finally {
    await other.dispose()
  }
}
