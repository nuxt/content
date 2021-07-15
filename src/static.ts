import fs from 'fs/promises'
import hash from 'hasha'
import { Nuxt } from '@nuxt/kit'
import { join, resolve } from 'upath'
import { getDatabase } from './runtime/nitro/content'

function isUrl(string: string) {
  try {
    // quick test if the string is an URL
    // eslint-disable-next-line no-new
    new URL(string)
  } catch (_) {
    return false
  }
  return true
}

export function generateStaticDatabaseFile(nuxt: Nuxt, options: any) {
  if (options.isSSG) {
    let publicPath = nuxt.options.build.publicPath // can be an url
    let routerBasePath = nuxt.options.router.base

    /* istanbul ignore if */
    if (publicPath[publicPath.length - 1] !== '/') {
      publicPath += '/'
    }
    if (routerBasePath[routerBasePath.length - 1] === '/') {
      routerBasePath = routerBasePath.slice(0, -1)
    }
    nuxt.hook('generate:distRemoved', async () => {
      const db = await getDatabase()
      const serial = await db.serialize()
      // Create a hash to fetch the database
      const dbHash = hash(String(serial)).substr(0, 8)
      if (nuxt.options.publicRuntimeConfig) {
        ;(nuxt.options.publicRuntimeConfig as any).docusDbHash = dbHash
      } else {
        nuxt.hook('vue-renderer:ssr:context', renderContext => {
          renderContext.nuxt.docusDbHash = dbHash
        })
      }

      const dir = resolve(nuxt.options.buildDir, 'dist', 'client', options.apiBase)

      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(join(dir, `db-${dbHash}.json`), serial, 'utf-8')
    })
    options.dbPath = isUrl(publicPath)
      ? `${publicPath}${options.apiBase}`
      : `${routerBasePath}${publicPath}${options.apiBase}`
  }
}
