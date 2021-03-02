const { join, resolve } = require('path')
const fs = require('graceful-fs').promises
const mkdirp = require('mkdirp')
const defu = require('defu')
const logger = require('consola').withScope('@nuxt/content')
const hash = require('hasha')

const middleware = require('./middleware')
const Database = require('./database')
const WS = require('./ws')
const { getDefaults, processMarkdownOptions } = require('./utils')

module.exports = async function (moduleOptions) {
  const { nuxt } = this
  const isSSG =
    this.options.dev === false &&
    (this.options.target === 'static' ||
      this.options._generate ||
      this.options.mode === 'spa')

  const { content = {} } = Object.assign({}, this.options)
  Object.assign(content, moduleOptions)

  if (content.markdown && content.markdown.basePlugins) {
    logger.warn(
      'Using `markdown.basePlugins` is deprecated. Use `markdown.remarkPlugins` as a function instead.'
    )
    const basePlugins = [...content.markdown.basePlugins]
    content.markdown.remarkPlugins = () => basePlugins
    delete content.markdown.basePlugins
  }
  if (content.markdown && content.markdown.plugins) {
    logger.warn(
      'Using `markdown.plugins` is deprecated. Use `markdown.remarkPlugins` as an array instead.'
    )
    const plugins = [...content.markdown.plugins]
    if (content.markdown.remarkPlugins) {
      if (typeof content.markdown.remarkPlugins === 'function') {
        const oldPlugins = [...content.markdown.remarkPlugins()]
        content.markdown.remarkPlugins = () => oldPlugins.concat(plugins)
      } else {
        content.markdown.remarkPlugins = content.markdown.remarkPlugins.concat(
          plugins
        )
      }
    } else {
      content.markdown.remarkPlugins = plugins
    }
    delete content.markdown.plugins
  }

  const defaults = getDefaults({ dev: this.options.dev })

  const options = defu.arrayFn(content, defaults)
  const relativeDir = options.dir
  options.dir = resolve(this.options.srcDir, options.dir)

  processMarkdownOptions(options, this.nuxt.resolver.resolvePath)

  options.apiPrefixWithBase = options.apiPrefix
  if (this.options.router.base) {
    let baseRouter = this.options.router.base

    if (baseRouter[0] === '/') {
      baseRouter = baseRouter.substring(1)
    }

    options.apiPrefixWithBase = baseRouter + options.apiPrefix
  }

  nuxt.callHook('content:options', options)

  // Nuxt hooks
  const globalComponents = resolve(this.options.srcDir, 'components/global')
  const dirStat = await fs.stat(globalComponents).catch(() => null)
  if (dirStat && dirStat.isDirectory()) {
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: '~/components/global',
        global: true,
        pathPrefix: false
      })
    })
  } else {
    // restart Nuxt on first component creation inside the dir
    nuxt.options.watch.push(globalComponents)
  }

  this.nuxt.hook('generate:cache:ignore', ignore => ignore.push(relativeDir))

  const ws = new WS({
    apiPrefix: options.apiPrefixWithBase
  })
  this.nuxt.hook('listen', (server) => {
    server.on('upgrade', (...args) => ws.callHook('upgrade', ...args))
  })

  const database = new Database({
    ...options,
    cwd: this.options.srcDir
  })

  // Database hooks
  database.hook('file:beforeInsert', item =>
    this.nuxt.callHook('content:file:beforeInsert', item, database)
  )
  database.hook('file:beforeParse', file =>
    this.nuxt.callHook('content:file:beforeParse', file)
  )
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

    const path = paths
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/^\//, '')

    return database.query(`/${path}`, options)
  }
  $content.database = database
  module.exports.$content = $content

  // Call content:ready hook
  await this.nuxt.callHook('content:ready', $content)

  // Add $content reference to ssrContext
  this.nuxt.hook('vue-renderer:context', (ssrContext) => {
    ssrContext.$content = $content
  })

  // Add prism theme
  if (options.markdown.prism.theme && !options.markdown.highlighter) {
    this.nuxt.options.css.push(options.markdown.prism.theme)
  }

  // Add content server middleware
  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: middleware({
      ws,
      database,
      dir: options.dir,
      watch: options.watch
    })
  })

  // Add server plugin
  this.addPlugin({
    fileName: 'content/plugin.server.js',
    src: join(__dirname, '../templates/plugin.server.js'),
    options: {
      watch: options.watch,
      liveEdit: options.liveEdit
    }
  })

  /* istanbul ignore if */
  if (isSSG) {
    // Create a hash to fetch the database
    const dbHash = hash(JSON.stringify(database.items._data)).substr(0, 8)
    // Pass the hash to the publicRuntimeConfig to be used in client side
    if (this.options.publicRuntimeConfig) {
      this.options.publicRuntimeConfig.content = { dbHash }
    } else {
      this.nuxt.hook('vue-renderer:ssr:context', (renderContext) => {
        renderContext.nuxt.content = { dbHash }
      })
    }
    // Write db.json
    this.nuxt.hook('generate:distRemoved', async () => {
      const dir = resolve(this.options.buildDir, 'dist', 'client', 'content')

      await mkdirp(dir)
      await fs.writeFile(
        join(dir, `db-${dbHash}.json`),
        database.db.serialize(),
        'utf-8'
      )
    })

    // Add client plugin
    this.addTemplate({
      fileName: 'content/plugin.client.lazy.js',
      src: join(__dirname, '../templates/plugin.static.lazy.js'),
      options: {
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
      src: join(__dirname, '../templates/plugin.static.js'),
      options: {
        // if publicPath is an URL, use public path, if not, add basepath before it
        dbPath: isUrl(publicPath)
          ? `${publicPath}content`
          : `${routerBasePath}${publicPath}content`
      }
    })
  } else {
    this.addPlugin({
      fileName: 'content/plugin.client.js',
      src: join(__dirname, '../templates/plugin.client.js'),
      options: {
        apiPrefix: options.apiPrefixWithBase,
        watch: options.watch,
        liveEdit: options.liveEdit,
        readyCallbackName: this.options.globals.readyCallback(
          this.options.globalName
        )
      }
    })
  }

  // Add client plugin QueryBuilder
  this.addTemplate({
    fileName: 'content/query-builder.js',
    src: join(
      __dirname,
      isSSG ? 'query-builder.js' : '../templates/query-builder.js'
    )
  })

  // Add client plugin component
  this.addTemplate({
    fileName: 'content/nuxt-content.js',
    src: join(__dirname, '../templates/nuxt-content.js')
  })
  if (options.watch && options.liveEdit) {
    // Add dev client plugin component
    this.addTemplate({
      fileName: 'content/nuxt-content.dev.vue',
      src: join(__dirname, '../templates/nuxt-content.dev.vue'),
      options: {
        apiPrefix: options.apiPrefixWithBase,
        editor: options.editor
      }
    })
    // Add dev editor component
    this.addTemplate({
      fileName: 'content/editor.vue',
      src: join(__dirname, '..', 'templates', 'editor.vue')
    })
  }

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
module.exports.getOptions = (userOptions = {}) => {
  const defaults = getDefaults({ dev: process.env.NODE_ENV !== 'production' })
  const options = defu.arrayFn(userOptions, defaults)

  processMarkdownOptions(options)

  return options
}
