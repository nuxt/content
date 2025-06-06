import type { Nuxt } from '@nuxt/schema'
import { createParser } from '../../src/utils/content'
import type { ResolvedCollection } from '@nuxt/content'

export async function parseContent(id: string, body: string, collection: ResolvedCollection, nuxt?: Nuxt) {
  return (await createParser(collection, nuxt))({
    id,
    body,
    path: '/invalid/path',
  })
}
