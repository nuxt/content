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

  const $content = function (...args) {
    const path = args.join('/').replace(/\/+/g, '/').replace(/^\//, '')

    return database.query(`/${path}`)
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
    let routerBasePath = this.options.router.base

    /* istanbul ignore if */
    if (publicPath[publicPath.length - 1] !== '/') {
      publicPath += '/'
    }
    if (routerBasePath[routerBasePath.length - 1] === '/') {
      routerBasePath = routerBasePath.slice(0, -1)
    }
    this.addPlugin({
      fileName: 'content/plugin.client.js',
      src: join(__dirname, 'templates/plugin.static.js'),
      options: {
        // if publicPath is an URL, use public path, if not, add basepath before it
        dbPath: isUrl(publicPath) ? `${publicPath}content/db.json` : `${routerBasePath}${publicPath}content/db.json`
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
  function isUrl (string) {
    try {
      // quick test if the string is an URL
      // eslint-disable-next-line no-new
      new URL(string)
    } catch (_) {
      return false
    }
    return true
  }
}

module.exports.Database = Database
module.exports.middleware = middleware
