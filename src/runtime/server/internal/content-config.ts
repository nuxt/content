import { readContentConfigSources } from '../../v3/content-config'
import { createNuxtContent } from '../content'

// Used when the project has a Nuxt Content v3 `content.config.ts` (and no
// `server/content.ts`): every collection becomes a named source on a content hub,
// so `queryCollection('<collection>')` keeps working.
export const content = createNuxtContent({
  mode: 'hybrid',
  sources: readContentConfigSources('content.config.ts', { cwd: import.meta.rootDir }),
})
