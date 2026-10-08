import { readContentConfigSources } from '../../v3/content-config'
import { createNuxtContent } from '../content'

// Used when the project has a Nuxt Content v3 `content.config.ts` (and no
// `server/content.ts`): every collection becomes a named source on a content hub,
// so `queryCollection('<collection>')` keeps working.
// Configs from every layer are merged (lowest priority first), so a collection
// redefined by a higher-priority layer (or the project) replaces the inherited
// one. Each collection resolves its sources relative to its own layer.
export const content = createNuxtContent({
  mode: 'hybrid',
  sources: Object.assign(
    {},
    ...import.meta.content.configPaths.map(path => readContentConfigSources(path)),
  ),
})
