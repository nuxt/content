import { createNuxtContent } from '@nuxt/content/app'
import type { ContentPlugin } from 'comark-content'

// Shadowed by the project's `app/content.ts`.
const layer: ContentPlugin = {
  name: 'probe-layer',
  setup(content) {
    const target = content as unknown as { probes?: string[] }
    target.probes = [...(target.probes ?? []), 'layer']
  },
}

export const content = createNuxtContent({ plugins: [layer] })
