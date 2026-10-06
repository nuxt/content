import fs from 'comark-content/sources/fs'
import media from 'comark-content/plugins/media'
import { createNuxtContent } from '../cms'

export const cms = createNuxtContent({
  mode: 'hybrid',
  // Named `content` so v3 composables (`queryCollection('content')`) keep working.
  name: 'content',
  source: fs('content', { cwd: import.meta.rootDir }),
  plugins: [
    media(),
  ],
})
