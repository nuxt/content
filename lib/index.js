const { join } = require('path')
const middleware = require('./middleware')
const Database = require('./database')
const SSE = require('./sse')

module.exports = async function (moduleOptions) {
  const options = {
    dir: join(this.options.srcDir, 'content'),
    watch: this.options.dev,
    ...this.options.server,
    ...this.options.content,
    ...moduleOptions
  }

  const sse = new SSE()

  const database = new Database({ sse }, options)
  await database.init()

  this.addServerMiddleware((req, res, next) => {
    req.database = database
    req.sse = sse
    next()
  })

  this.addServerMiddleware({
    path: '/content',
    handler: middleware
  })

  // Add runtime plugin
  this.addPlugin({
    fileName: 'plugins/content.js',
    src: join(__dirname, 'templates/plugin.js'),
    options: {
      url: `${options.https ? 'https' : 'http'}://${options.host}:${options.port}/content`,
      watch: options.watch
    }
  })
}
