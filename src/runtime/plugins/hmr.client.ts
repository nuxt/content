import { defineNuxtPlugin, refreshNuxtData } from '#app'
import type { AnyComarkContent, ContentHub } from 'comark-content'
import { HMR_REMOVE_EVENT, HMR_UPDATE_EVENT, type ContentHmrRemove, type ContentHmrUpdate } from '../utils/hmr'

type LiveInstance = AnyComarkContent & {
  resetSearchIndex?: () => Promise<void>
  query?: () => { count: () => Promise<number> }
}

/**
 * Development only: apply content changes pushed by the module's watcher.
 *
 * In hybrid mode the browser holds its own instance hydrated from the snapshot,
 * so the changed file is patched into it (which also updates the SQL query
 * index). In server-only mode reads go through the server, which is already up
 * to date. Either way, `useAsyncData` is refreshed so pages re-render.
 */
export default defineNuxtPlugin(() => {
  const hot = import.meta.hot
  if (!hot) return

  // Serialise patches so a burst of saves is applied in order.
  let queue = Promise.resolve()
  const enqueue = (task: (instances: LiveInstance[]) => Promise<void>) => {
    queue = queue
      .then(async () => {
        const instances = await loadInstances()
        await task(instances)
        await warmQueryIndexes(instances)
        await refreshNuxtData()
      })
      .catch(error => console.error('[nuxt/content] failed to apply content update', error))
  }

  hot.on(HMR_UPDATE_EVENT, (payload: ContentHmrUpdate) => enqueue(async (instances) => {
    const instance = findLoaded(instances, payload.source)
    if (!instance) return
    await instance.update(payload.file)
    await resetSearchIndexes(instances)
  }))

  hot.on(HMR_REMOVE_EVENT, (payload: ContentHmrRemove) => enqueue(async (instances) => {
    const instance = findLoaded(instances, payload.source)
    if (!instance) return
    await instance.remove(payload.key)
    await resetSearchIndexes(instances)
  }))
})

/**
 * The in-browser content instances (hybrid mode), or none in server-only mode
 * where the browser reads through the server. Imported lazily (the same module
 * the `content` auto-import resolves to) so pages that never read content don't
 * fetch the snapshot just for this plugin.
 */
async function loadInstances(): Promise<LiveInstance[]> {
  const { content } = await import('#build/content/client') as { content: unknown }
  if (isHub(content)) {
    return content.names.map(name => content.from(name) as LiveInstance)
  }
  // Server-only mode: an HTTP client, nothing to patch.
  if (content && typeof content === 'object' && 'update' in content) {
    return [content as LiveInstance]
  }
  return []
}

/**
 * An instance that has not loaded its snapshot yet will fetch the already-updated
 * one, and patching it first would be overwritten by that load anyway.
 */
function findLoaded(instances: LiveInstance[], source: string): LiveInstance | undefined {
  const instance = instances.find(instance => instance.name === source)
  return instance?.status.startsWith('initialized') ? instance : undefined
}

function isHub(value: unknown): value is ContentHub {
  return !!value && typeof value === 'object' && typeof (value as ContentHub).from === 'function'
}

/**
 * Build each instance's SQL query index one at a time before refreshing.
 * `refreshNuxtData()` re-runs every `useAsyncData` in parallel, and the
 * `sql-query` plugin fails concurrent first builds of the same index (one drops
 * the table while another reads it), which surfaces as missing pages.
 */
async function warmQueryIndexes(instances: LiveInstance[]) {
  for (const instance of instances) {
    await instance.query?.().count()
  }
}

/** Full-text search has no per-file update, so drop the index; it is rebuilt on the next search. */
async function resetSearchIndexes(instances: LiveInstance[]) {
  await Promise.all(instances.map(instance => instance.resetSearchIndex?.()))
}
