const { join } = require('path')
const defu = require('defu')

const middleware = require('./middleware')
const Database = require('./database')
const SSE = require('./sse')

const defaults = {
  watch: false,
  apiPrefix: '__content',
  dir: 'content'
}

module.exports = async function (moduleOptions) {
  const options = defu({
    watch: this.options.dev,
    ...this.options.content,
    ...moduleOptions
  }, defaults)

  options.dir = join(this.options.srcDir, options.dir)

  const sse = new SSE()

  // Initialize database from file system
  const database = new Database({ sse }, options)
  await database.init()

  // Add database and sse references to req to be used in content middleware
  this.addServerMiddleware((req, res, next) => {
    req.database = database
    req.sse = sse
    next()
  })

  // Add content server middleware
  this.addServerMiddleware({
    path: options.apiPrefix,
    handler: middleware
  })

  // Add server plugin
  this.addPlugin({
    fileName: 'content/plugin.server.js',
    src: join(__dirname, 'templates/plugin.server.js')
  })

  // Add client plugin
  this.addPlugin({
    fileName: 'content/plugin.client.js',
    src: join(__dirname, 'templates/plugin.client.js'),
    options: {
      apiPrefix: options.apiPrefix,
      watch: options.watch
    }
  })

  // Add client plugin QueryBuilder
  this.addTemplate({
    fileName: 'content/QueryBuilder.js',
    src: join(__dirname, 'templates/QueryBuilder.js')
  })
}
