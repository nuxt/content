import { createContentConfigSources } from '../../v3/content-config'
import { createNuxtContent } from '../content'

// Used when the project has a Nuxt Content v3 `content.config.ts` (and no
// `server/content.ts`): every collection becomes a named source on a content hub,
// so `queryCollection('<collection>')` keeps working.
// The configs of every layer are evaluated by the module at build time and
// merged (lowest priority first), so a collection redefined by a higher-priority
// layer (or the project) replaces the inherited one.
export const content = createNuxtContent({
  mode: 'hybrid',
  sources: createContentConfigSources(import.meta.content.collections),
})
