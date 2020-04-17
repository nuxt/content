const { join } = require('path')
const defu = require('defu')

const middleware = require('./middleware')
const Database = require('./database')
const Markdown = require('./parsers/markdown')
const Yaml = require('./parsers/yaml')
const Csv = require('./parsers/csv')
const SSE = require('./sse')

const defaults = {
  watch: false,
  apiPrefix: '_content',
  dir: 'content',
  fullTextSearchFields: ['title', 'description', 'slug'],
  markdown: {
    externalLinks: {},
    prism: {
      theme: 'prismjs/themes/prism.css'
    }
  },
  yaml: {},
  csv: {}
}

module.exports = async function (moduleOptions) {
  const isSSG =
    this.options.dev === false &&
    (this.options.target === 'static' || this.options._generate)
  const options = defu(
    {
      watch: this.options.dev,
      ...this.options.content,
      ...moduleOptions
    },
    defaults
  )

  options.dir = join(this.options.srcDir, options.dir)

  const sse = new SSE()
  const markdown = new Markdown({ nuxt: this.nuxt }, options.markdown)
  const yaml = new Yaml({}, options.yaml)
  const csv = new Csv({}, options.csv)

  // Initialize database from file system
  const database = new Database(
    { sse, markdown, csv, yaml, nuxt: this.nuxt },
    options
  )
  await database.init()

  this.nuxt.hook('close', () => database.close())

  // Add database and sse references to req to be used in content middleware
  this.nuxt.hook('vue-renderer:context', (ssrContext) => {
    ssrContext.database = database
  })

  // Add content server middleware
  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: middleware({ sse })
  })

  // Add server plugin
  this.addPlugin({
    fileName: 'content/plugin.server.js',
    src: join(__dirname, 'templates/plugin.server.js')
  })

  if (isSSG) {
    this.addTemplate({
      fileName: 'content/db.json',
      src: join(__dirname, 'templates/db.json'),
      options: {
        db: database.db.serialize()
      }
    })

    // Add client plugin
    this.addTemplate({
      fileName: 'content/plugin.client.lazy.js',
      src: join(__dirname, 'templates/plugin.static.lazy.js'),
      options: {
        apiPrefix: options.apiPrefix,
        watch: options.watch,
        fullTextSearchFields: options.fullTextSearchFields,
        dirs: database.dirs
      }
    })
    this.addPlugin({
      fileName: 'content/plugin.client.js',
      src: join(__dirname, 'templates/plugin.static.js')
    })
  } else {
    this.addPlugin({
      fileName: 'content/plugin.client.js',
      src: join(__dirname, 'templates/plugin.client.js'),
      options: {
        apiPrefix: options.apiPrefix,
        watch: options.watch
      }
    })
  }

  // Add client plugin QueryBuilder
  this.addTemplate({
    fileName: 'content/query-builder.js',
    src: join(
      __dirname,
      isSSG ? 'database/query-builder.js' : 'templates/query-builder.js'
    )
  })

  // Add client plugin component
  this.addTemplate({
    fileName: 'content/nuxt-content.js',
    src: join(__dirname, 'templates/nuxt-content.js')
  })
}
