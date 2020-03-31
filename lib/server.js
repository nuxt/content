const { promisify } = require('util')
const { resolve, join } = require('path')
const fse = require('fs-extra')
const micro = require('micro')
const nodeReq = require('node-req')
const Markdown = require('@nuxt/markdown')
const graymatter = require('gray-matter')
const chokidar = require('chokidar')
const logger = require('consola').withScope('@nuxtjs/content')
const SSE = require('./sse')
const { debounce } = require('./utils')

class Server {
  constructor (options) {
    this.dir = options.dir || process.cwd()
    this.port = options.port || 3001
    this.md = new Markdown({ toc: false, sanitize: false })
    this.server = null
    options.watch && this.watch()
  }

  async handle (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    const url = nodeReq.url(req)
    // Handle SSE
    if (this.sse && url === '/sse') {
      return this.sse.subscribe(req, res)
    }

    const path = resolve(this.dir, url.slice(1))
    try {
      const data = await this.get(path)
      micro.send(res, 200, data)
    } catch (err) {
      micro.send(res, 404, { message: err.message })
    }
  }

  // Server handle request method
  async get (path) {
    path = path.replace(/\.[^/.]+$/, '') // Remove extension
    const permalink = path.replace(this.dir, '')
    const stats = await fse.lstat(path).catch(err => null) // eslint-disable-line handle-callback-err

    if (stats && stats.isDirectory()) {
      return this.getDir(path)
    }

    let data = null

    // Check if Markdown path exists
    const mdPath = path + '.md'
    if (await fse.pathExists(mdPath)) {
      data = {}
      data.body = await fse.readFile(mdPath, 'utf8')
      if (data.body.trimStart().startsWith('---')) {
        const metadata = graymatter(data.body)
        data = {
          ...metadata.data,
          body: metadata.content
        }
      }
    }
    // Otherwise JSON path
    const jsonPath = path + '.json'
    if (await fse.pathExists(jsonPath)) {
      data = await fse.readJson(jsonPath)
    }

    if (!data) {
      throw new Error(`Content not found [${permalink}]`)
    }
    // Transform markdown body to html
    if (typeof data.body === 'string') {
      data.body = await this.md.toMarkup(data.body).then(({ html }) => html)
    }

    data.path = data.path || permalink

    return data
  }

  async getDir (path) {
    const files = (await fse.readdir(path, { withFileTypes: true })).filter(file => file.isFile())
    const filesData = await Promise.all(files.map(file => this.get(join(path, file.name))))

    return filesData
  }

  watch () {
    this.sse = new SSE()
    chokidar.watch(['**/*'], {
      cwd: this.dir,
      ignoreInitial: true,
      ignored: 'node_modules/**/*'
    })
      .on('change', debounce(path => this.sse.broadcast('change', { event: 'change', path }), 200))
      .on('add', debounce(path => this.sse.broadcast('change', { event: 'add', path }), 200))
      .on('unlink', debounce(path => this.sse.broadcast('change', { event: 'unlink', path }), 200))
  }

  // Start server
  async listen () {
    if (this.server) {
      return
    }

    this.server = micro(this.handle.bind(this))
    this.server.listen = promisify(this.server.listen)
    this.server.close = promisify(this.server.close)

    await this.server.listen(this.port)

    this.server.url = `http://localhost:${this.port}`
    logger.success(`Contents server listening on \`${this.server.url}\``)
  }

  // Stop server
  async close () {
    if (!this.server) {
      return
    }

    logger.info('Stopping contents server...')
    await this.server.close()
    delete this.server
  }
}

module.exports = Server
