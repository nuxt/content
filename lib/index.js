const { join } = require('path')
// const logger = require('consola').withScope('@nuxtjs/content')
const getPort = require('get-port')
const Server = require('./server')

module.exports = async function (moduleOptions) {
  const isDev = this.options.dev
  const port = await getPort()

  const options = {
    port,
    dir: join(this.options.srcDir, 'content'),
    watch: isDev,
    ...this.options.content,
    ...moduleOptions
  }

  // Start docs server
  const server = new Server(options)
  await server.listen()
  this.nuxt.hook('close', () => server.close())

  // Add runtime plugin
  this.addPlugin({
    fileName: 'plugins/content.js',
    src: join(__dirname, 'templates/plugin.js'),
    options: {
      url: `http://localhost:${options.port}`,
      watch: options.watch
    }
  })
}
