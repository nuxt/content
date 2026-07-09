import type { createCMS } from '@comark/cms'
import { createJiti } from 'jiti'

function createCMSJiti(rootDir: string) {
  const babelJiti = createJiti(import.meta.url)
  return createJiti(import.meta.url, {
    tryNative: false,
    moduleCache: false,
    fsCache: false,
    transform: (opts) => {
      const source = opts.source.replace(/import\.meta\.rootDir/g, JSON.stringify(rootDir))
      return { code: babelJiti.transform({ ...opts, source }) }
    },
  })
}

export async function importCMS(rootDir: string, filename: string) {
  const jiti = createCMSJiti(rootDir)
  return await jiti.import(filename) as { cms: { options: Parameters<typeof createCMS>[0] } }
}
