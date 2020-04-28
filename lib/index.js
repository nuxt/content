const { join, resolve } = require('path')
const fs = require('fs').promises
const mkdirp = require('mkdirp')
const defu = require('defu')

const middleware = require('./middleware')
const Database = require('./database')
const Markdown = require('./parsers/markdown')
const Yaml = require('./parsers/yaml')
const Csv = require('./parsers/csv')
const WS = require('./ws')

const defaults = {
  watch: false,
  apiPrefix: '_content',
  dir: 'content',
  fullTextSearchFields: ['title', 'description', 'slug', 'text'],
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

  options.dir = resolve(this.options.srcDir, options.dir)

  const ws = new WS(this.nuxt, options)
  const markdown = new Markdown({ nuxt: this.nuxt }, options.markdown)
  const yaml = new Yaml({}, options.yaml)
  const csv = new Csv({}, options.csv)

  // Initialize database from file system
  const database = new Database(
    { ws, markdown, csv, yaml, nuxt: this.nuxt },
    options
  )
  await database.init()

  this.nuxt.hook('close', () => database.close())

  const $content = function (...args) {
    const path = args.join('/').replace(/\/+/g, '/').replace(/^\//, '')

    return database.query(`/${path}`)
  }
  module.exports.$content = $content
  // Add $content reference to ssrContext
  this.nuxt.hook('vue-renderer:context', (ssrContext) => {
    ssrContext.$content = $content
  })

  // Add content server middleware
  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: middleware({ ws, database })
  })

  // Add server plugin
  this.addPlugin({
    fileName: 'content/plugin.server.js',
    src: join(__dirname, 'templates/plugin.server.js')
  })

  /* istanbul ignore if */
  if (isSSG) {
    // Write db.json
    this.nuxt.hook('build:done', async () => {
      const dir = resolve(this.options.buildDir, 'dist', 'client', 'content')

      await mkdirp(dir)
      await fs.writeFile(join(dir, 'db.json'), database.db.serialize(), 'utf-8')
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

    let publicPath = this.options.build.publicPath // can be an url
    /* istanbul ignore if */
    if (publicPath[publicPath.length - 1] !== '/') {
      publicPath += '/'
    }
    this.addPlugin({
      fileName: 'content/plugin.client.js',
      src: join(__dirname, 'templates/plugin.static.js'),
      options: {
        dbPath: publicPath + 'content/db.json'
      }
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
