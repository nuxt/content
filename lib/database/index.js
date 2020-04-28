const { join, extname } = require('path')
const fs = require('fs').promises
const chokidar = require('chokidar')
const JSON5 = require('json5')
const Loki = require('@lokidb/loki').default
const LokiFullTextSearch = require('@lokidb/full-text-search').default
const logger = require('consola').withScope('@nuxtjs/content')
const { default: PQueue } = require('p-queue')

const QueryBuilder = require('./query-builder')
const EXTENSIONS = ['.md', '.json', '.json5', '.yaml', '.csv']

LokiFullTextSearch.register()

class Database {
  constructor (context, options) {
    this.dir = options.dir || process.cwd()
    this.ws = context.ws
    this.markdown = context.markdown
    this.yaml = context.yaml
    this.csv = context.csv
    this.nuxt = context.nuxt
    // Create Loki database
    this.db = new Loki('content.db')
    // Init collection
    this.items = this.db.addCollection('items', { fullTextSearch: options.fullTextSearchFields.map(field => ({ field })) })
    // Call chokidar watch if option if provided (dev only)
    options.watch && this.watch()
    this.options = options
  }

  /**
   * Query items from collection
   * @param {string} path - Requested path (path / directory).
   * @returns {QueryBuilder} Instance of QueryBuilder to be chained
   */
  query (path) {
    const isDir = !path || !!this.dirs.find(dir => dir === path)
    // Look for dir or path
    const query = isDir ? { dir: path } : { path }
    // Postprocess to get only first result (findOne)
    const postprocess = isDir ? [] : [data => data[0]]

    return new QueryBuilder({
      query: this.items.chain().find(query, !isDir),
      path,
      postprocess
    }, this.options)
  }

  /**
   * Clear items in database and load files into collection
   */
  async init () {
    this.dirs = ['/']
    this.items.clear()

    const startTime = process.hrtime()
    await this.walk(this.dir)
    const [s, ns] = process.hrtime(startTime)
    logger.info(`Parsed ${this.items.count()} files in ${s},${Math.round(ns / 1e8)} seconds`)
  }

  /**
   * Walk dir tree recursively
   * @param {string} dir - Directory to browse.
   */
  async walk (dir) {
    let files = []
    try {
      files = await fs.readdir(dir)
    } catch (e) {
      logger.warn(`${dir} does not exist`)
    }

    await Promise.all(files.map(async (file) => {
      const path = join(dir, file)
      const stats = await fs.stat(path)

      // ignore node_modules or hidden file
      /* istanbul ignore if */
      if (file.includes('node_modules') || (/(^|\/)\.[^/.]/g).test(file)) {
        return
      }

      /* istanbul ignore else */
      if (stats.isDirectory()) {
        // Store directory in local variable to be checked later
        this.dirs.push(this.normalizePath(path))
        // Walk recursively subfolder
        return this.walk(path)
      } else if (stats.isFile()) {
        // Add file to collection
        return this.insertFile(path)
      }
    }))
  }

  /**
   * Insert file in collection
   * @param {string} path - The path of the file.
   */
  async insertFile (path) {
    const item = await this.parseFile(path)

    if (!item) {
      return
    }

    await this.nuxt.callHook('content:file:beforeInsert', item)

    this.items.insert(item)
  }

  /**
   * Update file in collection
   * @param {string} path - The path of the file.
   */
  async updateFile (path) {
    const item = await this.parseFile(path)

    if (!item) {
      return
    }

    await this.nuxt.callHook('content:file:beforeUpdate', item)

    const document = this.items.findOne({ path: item.path })

    this.items.update({ ...document, ...item })
  }

  /**
   * Remove file from collection
   * @param {string} path - The path of the file.
   */
  async removeFile (path) {
    const normalizedPath = await this.normalizePath(path)
    const document = this.items.findOne({ path: normalizedPath })

    this.items.remove(document)
  }

  /**
   * Read a file and transform it to be insert / updated in collection
   * @param {string} path - The path of the file.
   */
  async parseFile (path) {
    const extension = extname(path)
    // If unkown extension, skip
    if (!EXTENSIONS.includes(extension)) {
      return
    }
    const file = await fs.readFile(path, 'utf-8')
    const stats = await fs.stat(path)

    // Get parser depending on extension
    const parser = ({
      '.json': file => JSON.parse(file),
      '.json5': file => JSON5.parse(file),
      '.md': file => this.markdown.toJSON(file),
      '.csv': file => this.csv.toJSON(file),
      '.yaml': file => this.yaml.toJSON(file)
    })[extension]
    // Collect data from file
    let data = {}
    /* istanbul ignore else */
    if (parser) {
      data = await parser(file)
    }
    // Normalize path without dir and ext
    const normalizedPath = this.normalizePath(path)
    // Extract dir from path
    const split = normalizedPath.split('/')
    const dir = split.slice(0, split.length - 1).join('/')

    return {
      ...data,
      dir: dir || '/',
      path: normalizedPath,
      extension,
      slug: split[split.length - 1],
      updatedAt: stats.mtime
    }
  }

  /**
   * Remove base dir and extension from file path
   * @param {string} path - The path of the file.
   * @returns {string} Normalized path
   */
  normalizePath (path) {
    return path.replace(this.dir, '').replace(/\.[^/.]+$/, '').replace(/\\/g, '/')
  }

  /**
   * Watch base dir for changes
   */
  /* istanbul ignore next */
  watch () {
    this.queue = new PQueue({ concurrency: 1 })

    this.watcher = chokidar.watch(['**/*'], {
      cwd: this.dir,
      ignoreInitial: true,
      ignored: 'node_modules/**/*'
    })
      .on('change', path => this.queue.add(this.refresh.bind(this, 'change', path)))
      .on('add', path => this.queue.add(this.refresh.bind(this, 'add', path)))
      .on('unlink', path => this.queue.add(this.refresh.bind(this, 'unlink', path)))
  }

  /**
   * Init database and broadcast change through Websockets
   */
  /* istanbul ignore next */
  async refresh (event, path) {
    if (event === 'change') {
      await this.updateFile(`${this.dir}/${path}`)
    } else {
      await this.init()
    }

    this.ws.broadcast({ event, path })
  }

  /*
  ** Stop database and watcher and clear pointers
  */
  async close () {
    await this.db.close()
    this.db = null

    /* istanbul ignore if */
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
  }
}

module.exports = Database
