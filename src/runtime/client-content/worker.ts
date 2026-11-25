import { comarkContent, contentHub } from 'comark-content/runtime'
import snapshot from 'comark-content/sources/snapshot'
import { serveContentWorker } from 'comark-content/worker'
import type { ContentPlugin } from 'comark-content'

export { default as sqliteFullTextSearch } from 'comark-content/plugins/sqlite-full-text-search'
export { default as sqliteWasm } from 'comark-content/database/sqlite-wasm'

export interface NuxtContentWorkerOptions {
  /** Plugins of every instance in the worker, hydrated from the prerendered snapshots. Pass one database to rank a hub as one index. */
  plugins?: ContentPlugin<any>[]
}

/**
 * Declare the content instances that run in a web worker, in `app/content.worker.ts`.
 * The file is only evaluated in the worker, so its plugins (and sqlite-wasm) stay out of the app's bundle.
 */
export function createNuxtContentWorker<T extends NuxtContentWorkerOptions>(options: T): T {
  return options
}

/**
 * Serve the instances of `app/content.worker.ts` to `useNuxtContentWorker()`, from the generated worker entry.
 * Each instance loads its prerendered snapshot on its first read, so only the instances read are downloaded.
 * @internal
 */
export function startNuxtContentWorker(options: NuxtContentWorkerOptions, names: string[], baseURL: string) {
  serveContentWorker(() => contentHub(
    names.map(name => comarkContent(name, {
      source: snapshot(`${baseURL.replace(/\/?$/, '/')}__nuxt_content/snapshot/${name}.json`),
      plugins: options.plugins,
    })),
    { basePath: '/__nuxt_content' },
  ))
}
