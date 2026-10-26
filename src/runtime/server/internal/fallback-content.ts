import fs from 'comark-content/sources/fs'
import json from 'comark-content/plugins/json'
import media from 'comark-content/plugins/media'
import yaml from 'comark-content/plugins/yaml'
import { createNuxtContent } from '../content'

export const content = createNuxtContent({
  mode: 'hybrid',
  // Named `content` so v3 composables (`queryCollection('content')`) keep working.
  name: 'content',
  source: fs('content', { cwd: import.meta.rootDir }),
  plugins: [
    media(),
    // v3's default collection reads YAML and JSON files too.
    yaml(),
    json(),
  ],
})
