import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import cfPreset from './cloudflare-pages'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    // Make sure database is enabled
    const nuxthubOptions: { database?: boolean } = (nuxt.options as unknown as { hub: unknown }).hub ||= {}
    nuxthubOptions.database = true

    // Set up database
    options.database ||= { type: 'd1', bindingName: 'DB' }
  },
  async setupNitro(nitroConfig, options) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying to NuxtHub requires using D1 database, switching to D1 database with binding `DB`.')
      nitroConfig.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
    }

    await cfPreset.setupNitro(nitroConfig, options)

    if (nitroConfig.dev === false) {
      await mkdir(resolve(nitroConfig.rootDir!, '.data/hub/database/queries'), { recursive: true })
      let fileIndex = 1
      const MAX_FILE_SIZE = 100 * 1024 // 100KB - https://developers.cloudflare.com/d1/platform/limits/
      const dumpFiles: Array<{ file: string, content: string }> = []
      const initialStatement = 'DROP TABLE IF EXISTS _content_info;\n'

      let currentFileContent = initialStatement

      Object.values(options.manifest.dump).forEach((value) => {
        value.forEach((line) => {
          const statement = line.trim() + '\n'
          if (statement.trim().length === 0) {
            return
          }

          if (currentFileContent.length + statement.length > MAX_FILE_SIZE && currentFileContent !== initialStatement) {
            dumpFiles.push({
              file: `content-database-${String(fileIndex++).padStart(3, '0')}.sql`,
              content: currentFileContent.trim(),
            })
            currentFileContent = initialStatement + statement
          }
          else if (currentFileContent.length + statement.length > MAX_FILE_SIZE && currentFileContent === initialStatement) {
            if (initialStatement.trim().length > 0) {
              dumpFiles.push({
                file: `content-database-${String(fileIndex++).padStart(3, '0')}.sql`,
                content: initialStatement.trim(),
              })
            }
            currentFileContent = statement
          }
          else {
            currentFileContent += statement
          }
        })
      })

      if (currentFileContent.trim().length > 0 && currentFileContent.trim() !== initialStatement.trim()) {
        dumpFiles.push({
          file: `content-database-${String(fileIndex).padStart(3, '0')}.sql`,
          content: currentFileContent.trim(),
        })
      }
      else if (dumpFiles.length === 0 && initialStatement.trim().length > 0) {
        dumpFiles.push({
          file: `content-database-${String(fileIndex).padStart(3, '0')}.sql`,
          content: initialStatement.trim(),
        })
      }

      for (const dumpFile of dumpFiles) {
        if (dumpFile.content && dumpFile.content.trim().length > 0) {
          await writeFile(resolve(nitroConfig.rootDir!, '.data/hub/database/queries', dumpFile.file), dumpFile.content)
        }
      }
      // Disable integrity check in production for performance
      nitroConfig.runtimeConfig ||= {}
      nitroConfig.runtimeConfig.content ||= {}
      nitroConfig.runtimeConfig.content.integrityCheck = false
    }
  },
})
