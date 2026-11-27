import { defineEventHandler } from 'nuxt/server'
import type { AnyComarkContent } from 'comark-content'
import { content } from '../content'

const served: Record<string, AnyComarkContent[]> = {}

// Return every instance each source was served from, with its status now.
export default defineEventHandler(async () => {
  const resolved = await resolveContent(content)
  for (const instance of 'instances' in resolved ? resolved.instances as AnyComarkContent[] : [resolved]) {
    const instances = served[instance.name] ||= []
    if (!instances.includes(instance)) instances.push(instance)
  }
  return Object.fromEntries(Object.entries(served).map(([name, instances]) => [name, instances.map(({ ref, status }) => ({ ref, status }))]))
})
