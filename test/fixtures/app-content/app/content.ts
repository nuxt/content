import { createNuxtContent } from '@nuxt/content/app'
import type { ContentPlugin } from 'comark-content'

const project: ContentPlugin = {
  name: 'probe-project',
  setup(content) {
    const target = content as unknown as { probes?: string[] }
    target.probes = [...(target.probes ?? []), 'project']
  },
}

export const content = createNuxtContent({ plugins: [project] })
