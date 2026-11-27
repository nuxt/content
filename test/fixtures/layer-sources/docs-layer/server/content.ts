import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { JsonSchema } from 'comark-content'
import { createNuxtContent } from '@nuxt/content/server'
import fs from 'comark-content/sources/fs'
import json from 'comark-content/plugins/json'
import yaml from 'comark-content/plugins/yaml'

const cwd = import.meta.rootDir

// Decided from the disk, as Docus does. On a deployed server `content/` is gone and this differs,
// which is harmless: the instance keeps its name and is served from the build's snapshot.
const exclude = existsSync(join(cwd, 'content/Fr/meta.yml')) ? ['Fr/meta.yml'] : []

// Docus would use `z.toJSONSchema(createDocsSchema())`.
const schema: JsonSchema = {
  type: 'object',
  properties: {
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, icon: { type: 'string' }, to: { type: 'string' }, target: { type: 'string' } },
        required: ['label', 'icon', 'to'],
      },
    },
  },
}

export const content = createNuxtContent({
  mode: 'server-only',
  name: 'content',
  source: fs('content', { cwd, exclude, schema }),
  plugins: [yaml(), json()],
})
