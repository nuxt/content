const { join, resolve } = require('path')
const fs = require('fs').promises
const mkdirp = require('mkdirp')
const defu = require('defu')

const middleware = require('./middleware')
const Database = require('./database')
const WS = require('./ws')

const defaults = {
  watch: false,
  apiPrefix: '_content',
  dir: 'content',
  fullTextSearchFields: ['title', 'description', 'slug', 'text'],
  nestedProperties: [],
  markdown: {
    basePlugins: [
      'remark-squeeze-paragraphs',
      'remark-slug',
      'remark-autolink-headings',
      'remark-external-links',
      'remark-footnotes'
    ],
    plugins: [
    ],
    footnotes: {
      inlineNotes: true
    },
    externalLinks: {},
    prism: {
      theme: 'prismjs/themes/prism.css'
    }
  },
  yaml: {},
  csv: {}
}

module.exports = async function () {
  const isSSG =
    this.options.dev === false &&
    (this.options.target === 'static' || this.options._generate)
  const options = defu(
    {
      watch: this.options.dev,
      ...this.options.content
    },
    defaults
  )

  options.dir = resolve(this.options.srcDir, options.dir)

  const ws = new WS(options)
  this.nuxt.hook('listen', (server) => {
    server.on('upgrade', (...args) => ws.callHook('upgrade', ...args))
  })

  const database = new Database({
    ...options,
    cwd: this.options.srcDir
  })

  // Database hooks
  database.hook('file:beforeInsert', item => this.nuxt.callHook('content:file:beforeInsert', item))
  database.hook('file:updated', event => ws.broadcast(event))

  // Initialize database from file system
  await database.init()

  // close database when Nuxt closes
  this.nuxt.hook('close', () => database.close())
  // listen to nuxt server to updrag

  const $content = function () {
    let options
    const paths = []
    Array.from(arguments).forEach((argument) => {
      if (typeof argument === 'string') {
        paths.push(argument)
      } else if (typeof argument === 'object') {
        options = argument
      }
    })

    const path = paths.join('/').replace(/\/+/g, '/').replace(/^\//, '')

    return database.query(`/${path}`, options)
  }
  module.exports.$content = $content
  // Add $content reference to ssrContext
  this.nuxt.hook('vue-renderer:context', (ssrContext) => {
    ssrContext.$content = $content
  })

  // Add prism theme
  if (options.markdown.prism.theme) {
    this.nuxt.options.css.push(options.markdown.prism.theme)
  }

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
    this.nuxt.hook('generate:distRemoved', async () => {
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
      isSSG ? 'query-builder.js' : 'templates/query-builder.js'
    )
  })

  // Add client plugin component
  this.addTemplate({
    fileName: 'content/nuxt-content.js',
    src: join(__dirname, 'templates/nuxt-content.js')
  })
}

module.exports.Database = Database
module.exports.middleware = middleware
