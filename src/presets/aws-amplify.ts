import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'
import nodePreset from './node'

export default definePreset({
  name: 'aws-amplify',
  parent: nodePreset,
  async setup(options, nuxt) {
    options.database ||= { type: 'sqlite', filename: '/tmp/contents.sqlite' }

    // Fetching assets on server side is not working with AWS Amplify
    // Disable prerendering to avoid fetching assets on server side
    Object.keys(nuxt.options.routeRules || {}).forEach((route) => {
      if (route.startsWith('/__nuxt_content/') && route.endsWith('/sql_dump.txt')) {
        nuxt.options.routeRules![route]!.prerender = false
      }
    })

    try {
      await import('sqlite3')

      options.experimental ||= {}
      options.experimental.sqliteConnector = 'sqlite3'
    }
    catch {
      logger.error('Nuxt Content requires `sqlite3` module to work in AWS Amplify environment. Please run `npm install sqlite3` to install it and try again.')
      process.exit(1)
    }
  },
  async setupNitro(nitroConfig) {
    const database = nitroConfig.runtimeConfig?.content?.database
    if (database?.type === 'sqlite' && !database?.filename?.startsWith('/tmp')) {
      logger.warn('Deploying sqlite database to AWS Amplify is possible only in `/tmp` directory. Using `/tmp/contents.sqlite` instead.')
      database.filename = '/tmp/contents.sqlite'
    }
  },
})
