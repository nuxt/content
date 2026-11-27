import { readonly, shallowRef, toValue, unref, watch, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { SearchOptions, SearchResult } from 'comark-content'
import { createContentClient, type ContentClient, type ContentFetch } from 'comark-content/client'
import searchClient from 'comark-content/plugins/sqlite-full-text-search/client'
import { connectContentWorker, type ContentWorker } from 'comark-content/worker'
import { HMR_REMOVE_EVENT, HMR_UPDATE_EVENT } from '../utils/hmr'
import type { NuxtContentWorkerBasePaths } from './worker'

/** Matches the `searchStatus` prop of Nuxt UI's `<UContentSearch>`. */
export type NuxtContentWorkerStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface NuxtContentWorkerSearchOptions extends SearchOptions {
  /** Instances to search. Defaults to the instances of `useNuxtContentWorker()`. */
  instances?: string[]
}

export interface UseNuxtContentWorkerOptions {
  /**
   * Instances to load and read, such as the current locale's. Only their snapshots are downloaded.
   * When it changes after `warmup()`, the new instances are loaded. Every instance by default.
   */
  instances?: MaybeRefOrGetter<string[] | undefined>
  /**
   * Where the worker loads `snapshot/<name>.json` from, such as `/api/content/blob/<sha>`, or a function of the instance name.
   * Changing it starts a new worker. An instance without a path loads its prerendered snapshot.
   */
  basePath?: MaybeRef<string | undefined> | ((instance: string) => string | undefined)
}

export interface NuxtContentWorker {
  /** `ready` once the snapshots of the instances are loaded and their search index is built. */
  status: Readonly<Ref<NuxtContentWorkerStatus>>
  /** Start the worker and load the instances in the background, such as from `onNuxtReady()`. Safe to call again. */
  warmup: () => Promise<void>
  /** Full-text search in the worker. Takes the `search` prop of `<UContentSearch>`. */
  search: (query: string, opts?: NuxtContentWorkerSearchOptions) => Promise<SearchResult[]>
  /** A document of the instances, by public path. */
  get: ContentClient['get']
  /** The documents of the given instances, the composable's by default, without their bodies. */
  list: ContentClient['list']
}

/** Instances loaded or loading in the worker, shared by every `useNuxtContentWorker()`. */
const warmed = new Map<string, Promise<void>>()
let worker: ContentWorker | undefined
/** Where the worker loads each instance from. */
let basePaths: NuxtContentWorkerBasePaths = {}
let hmr = false

// The worker answers `handler()` requests, so the client is the one `server-only.ts` uses over HTTP.
const clientOptions = {
  basePath: '/__nuxt_content',
  fetch: ((url, opts) => worker!.fetch(url, opts)) as ContentFetch,
  plugins: [searchClient()],
}
const hub = createContentClient(clientOptions)
const bound = new Map<string, typeof hub>()
// Sends `?instance=<name>`, so a read only loads that instance.
const client = (name: string) => bound.get(name) ?? bound.set(name, createContentClient(name, clientOptions)).get(name)!

/** Created on the first call, so a page that never reads it doesn't download the worker. */
function start() {
  if (worker) return
  // Vite bundles the generated entry as its own chunk. A `#` alias would be read as a URL hash.
  const instance = new Worker(new URL('@nuxt/content/worker-entry', import.meta.url), { type: 'module', name: 'nuxt-content' })
  // Sent first: the worker creates its instances from it.
  instance.postMessage({ basePaths })
  const connection = worker = connectContentWorker(instance)
  // A failed connection rejects every later call: drop it, so the next call starts a new worker.
  const reset = () => {
    if (worker !== connection) return
    connection.terminate()
    worker = undefined
    warmed.clear()
  }
  instance.addEventListener('error', reset)
  instance.addEventListener('messageerror', reset)

  if (import.meta.hot && !hmr) {
    hmr = true
    import.meta.hot.on(HMR_UPDATE_EVENT, payload => worker?.update(payload))
    import.meta.hot.on(HMR_REMOVE_EVENT, payload => worker?.remove(payload))
  }
}

const loadsFrom = (paths: NuxtContentWorkerBasePaths) => JSON.stringify(paths) === JSON.stringify(basePaths)

/** Stop a worker that loads from other paths, so the next call starts one with these. */
function useBasePaths(paths: NuxtContentWorkerBasePaths) {
  if (loadsFrom(paths)) return
  worker?.terminate()
  worker = undefined
  warmed.clear()
  basePaths = paths
}

function warmOne(name: string) {
  let warming = warmed.get(name)
  if (!warming) {
    // The next call tries again.
    warming = hub.buildSearchIndex({ instances: [name] }).catch((error) => {
      warmed.delete(name)
      throw error
    })
    warmed.set(name, warming)
  }
  return warming
}

/**
 * The content instances of `app/content.worker.ts`, running in a web worker.
 * Reads and search there don't need a server, so they work on a static host.
 */
export function useNuxtContentWorker(options: UseNuxtContentWorkerOptions = {}): NuxtContentWorker {
  const status = shallowRef<NuxtContentWorkerStatus>('idle')
  // A plain copy: `postMessage()` can't clone a reactive array.
  const names = () => [...(toValue(options.instances) ?? import.meta.content.sources)]
  // Paths of every instance, so changing `instances` keeps the worker.
  const paths = () => {
    const { basePath } = options
    if (basePath === undefined) return undefined
    // Read into a variable: in dev, Nuxt doesn't replace the define when a property access follows it.
    const sources = import.meta.content.sources
    return Object.fromEntries(sources.map(name => [name, typeof basePath === 'function' ? basePath(name) : unref(basePath)]))
  }
  let started = false
  let current: Promise<void> | undefined

  function warmup() {
    if (import.meta.server) return Promise.resolve()
    const next = paths()
    if (next) useBasePaths(next)
    start()
    started = true
    const loading = Promise.all(names().map(warmOne)).then(() => {})
    current = loading
    status.value = 'loading'
    // Only the latest instances decide the status: a locale switch makes the previous load stale.
    loading.then(
      () => current === loading && (status.value = 'ready'),
      () => current === loading && (status.value = 'error'),
    )
    return loading
  }

  if (import.meta.client) {
    watch([names, paths], () => started && warmup().catch(() => {}))
  }

  function ready() {
    if (import.meta.server) throw new Error('`useNuxtContentWorker()` reads in the browser only.')
    const next = paths()
    // Warms up only when it hasn't, after a failure or for other paths: `<UContentSearch>` searches again each time `status` turns `ready`.
    if (status.value === 'idle' || status.value === 'error' || (next && !loadsFrom(next))) warmup().catch(() => {})
    // A worker dropped after a failure restarts on the next read.
    else start()
  }

  return {
    status: readonly(status),
    warmup,
    search: async (query, opts = {}) => {
      if (import.meta.server) return []
      ready()
      return hub.search(query, { ...opts, instances: opts.instances ?? names() })
    },
    // A hub `get` would load every instance to find the path.
    get: (async (path: string) => {
      ready()
      for (const name of names()) {
        const doc = await client(name).get(path)
        if (doc) return doc
      }
      return null
    }) as ContentClient['get'],
    list: ((list?: string[]) => {
      ready()
      return hub.list(list ?? names())
    }) as ContentClient['list'],
  }
}
