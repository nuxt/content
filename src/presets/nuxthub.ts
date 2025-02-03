import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { definePreset } from '../utils/preset'
import cfPreset from './cloudflare-pages'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    // Make sure database is enabled
    const nuxthubOptions: { database?: boolean } = (nuxt.options as unknown as { hub: unknown }).hub ||= {}
    nuxthubOptions.database = true
  },
  async setupNitro(nitroConfig, options) {
    await cfPreset.setupNitro(nitroConfig, options)

    if (nitroConfig.dev === false) {
      // Write SQL dump to database queries when not in dev mode
      await mkdir(resolve(nitroConfig.rootDir, '.data/hub/database/queries'), { recursive: true })
      let i = 1
      let dump = ''
      const dumpFiles: Array<{ file: string, content: string }> = []
      Object.values(options.manifest.dump).forEach((value) => {
        value.forEach((line) => {
          if ((dump.length + line.length) < 1000000) {
            dump += line + '\n'
          }
          else {
            dumpFiles.push({ file: `content-database-${String(i).padStart(3, '0')}.sql`, content: dump.trim() })
            dump = line
            i += 1
          }
        })
      })
      if (dump.length > 0) {
        dumpFiles.push({ file: `content-database-${String(i).padStart(3, '0')}.sql`, content: dump.trim() })
      }
      for (const dumpFile of dumpFiles) {
        await writeFile(resolve(nitroConfig.rootDir, '.data/hub/database/queries', dumpFile.file), dumpFile.content)
      }
      // Disable integrity check in production for performance
      nitroConfig.runtimeConfig.content.integrityCheck = false
    }
  },
})
