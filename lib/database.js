const { join } = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const chokidar = require('chokidar')
const Markdown = require('@dimerapp/markdown')
const Loki = require('lokijs')
const { debounce } = require('./utils')

class Database {
  constructor (context, options) {
    this.dir = options.dir || process.cwd()
    this.sse = context.sse
    this.files = []
    this.db = new Loki('content.db')
    this.items = this.db.addCollection('items')

    options.watch && this.watch()
  }

  query (path) {
    return this.items.chain().find({ path })
  }

  async init () {
    this.items.clear()

    await this.walk(this.dir)
  }

  async walk (dir) {
    const files = await fs.readdir(dir)

    await Promise.all(files.map(async (file) => {
      const filePath = join(dir, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        return this.walk(filePath)
      } else if (stats.isFile()) {
        return this.process(filePath)
      }
    }))
  }

  async process (path) {
    const file = await fs.readFile(path, 'utf-8')
    const { data: metadata, content } = matter(file)

    const md = new Markdown(content, {})
    const { contents: body } = await md.toJSON()

    this.items.insert({
      path: path.replace(this.dir, '').replace(/\.[^/.]+$/, ''),
      metadata,
      body
    })
  }

  watch () {
    chokidar.watch(['**/*'], {
      cwd: this.dir,
      ignoreInitial: true,
      ignored: 'node_modules/**/*'
    })
      .on('change', debounce(path => this.refresh('change', path), 200))
      .on('add', debounce(path => this.refresh('add', path), 200))
      .on('unlink', debounce(path => this.refresh('unlink', path), 200))
  }

  refresh (event, path) {
    this.init()

    this.sse.broadcast('change', { event, path })
  }
}

module.exports = Database
