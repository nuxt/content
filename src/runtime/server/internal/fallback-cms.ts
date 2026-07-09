import fs from '@comark/cms/sources/fs'
import media from '@comark/cms/plugins/media'
import { createNuxtContentCMS } from '../cms'

export const cms = createNuxtContentCMS({
  mode: 'hybrid',
  sources: {
    content: fs('content', { cwd: import.meta.rootDir }),
  },
  plugins: [
    media(),
  ],
})
