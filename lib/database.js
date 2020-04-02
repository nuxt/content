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
    this.directories = []
    this.db = new Loki('content.db')
    this.items = this.db.addCollection('items')

    options.watch && this.watch()
  }

  fetch (path) {
    const isDirectory = !!this.directories.find(directory => directory === path)

    if (isDirectory) {
      return this.items.find({ directory: path })
    } else {
      return this.items.findOne({ path })
    }
  }

  async init () {
    this.items.clear()

    await this.walk(this.dir)
  }

  async walk (dir) {
    const files = await fs.readdir(dir)

    await Promise.all(files.map(async (file) => {
      const path = join(dir, file)
      const stats = await fs.stat(path)

      if (stats.isDirectory()) {
        this.directories.push(this.normalizePath(path))
        return this.walk(path)
      } else if (stats.isFile()) {
        return this.process(path)
      }
    }))
  }

  async process (url) {
    const file = await fs.readFile(url, 'utf-8')
    const { data: metadata, content } = matter(file)

    const md = new Markdown(content, {})
    const { contents: body } = await md.toJSON()

    const path = this.normalizePath(url)
    const split = path.split('/')
    const directory = split.slice(0, split.length - 1).join('/')

    this.items.insert({
      path,
      directory,
      metadata,
      body
    })
  }

  normalizePath (path) {
    return path.replace(this.dir, '').replace(/\.[^/.]+$/, '')
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
