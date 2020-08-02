const { join, extname } = require('path')
const fs = require('graceful-fs').promises
const Hookable = require('hookable')
const chokidar = require('chokidar')
const JSON5 = require('json5')
const Loki = require('@lokidb/loki').default
const LokiFullTextSearch = require('@lokidb/full-text-search').default
const logger = require('consola').withScope('@nuxt/content')
const { default: PQueue } = require('p-queue')
const { Markdown, YAML, CSV, XML } = require('../parsers')

const QueryBuilder = require('./query-builder')
const EXTENSIONS = ['.md', '.json', '.json5', '.yaml', '.yml', '.csv', '.xml']

LokiFullTextSearch.register()

class Database extends Hookable {
  constructor (options) {
    super()
    this.dir = options.dir || process.cwd()
    this.cwd = options.cwd || process.cwd()
    this.markdown = new Markdown(options.markdown)
    this.yaml = new YAML(options.yaml)
    this.csv = new CSV(options.csv)
    this.xml = new XML(options.xml)
    // Create Loki database
    this.db = new Loki('content.db')
    // Init collection
    this.items = this.db.addCollection('items', {
      fullTextSearch: options.fullTextSearchFields.map(field => ({ field })),
      nestedProperties: options.nestedProperties
    })
    // User Parsers
    this.extendParser = options.extendParser || {}
    this.extendParserExtensions = Object.keys(this.extendParser)
    // Call chokidar watch if option if provided (dev only)
    options.watch && this.watch()
    this.options = options
  }

  /**
   * Query items from collection
   * @param {string} path - Requested path (path / directory).
   * @returns {QueryBuilder} Instance of QueryBuilder to be chained
   */
  query (path, { deep = false, text = false } = {}) {
    const isDir = !path || !!this.dirs.find(dir => dir === path)
    // Look for dir or path
    const query = isDir ? { dir: deep ? { $regex: new RegExp(`^${path}`) } : path } : { path }
    // Postprocess to get only first result (findOne)
    const postprocess = isDir ? [] : [data => data[0]]

    return new QueryBuilder({
      query: this.items.chain().find(query, !isDir),
      path,
      postprocess,
      text
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

    await this.callHook('file:beforeInsert', item)

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

    await this.callHook('file:beforeInsert', item)

    const document = this.items.findOne({ path: item.path })

    logger.info(`Updated ${path.replace(this.cwd, '.')}`)
    if (document) {
      this.items.update({ $loki: document.$loki, meta: document.meta, ...item })
      return
    }
    this.items.insert(item)
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
    if (!EXTENSIONS.includes(extension) && !this.extendParserExtensions.includes(extension)) {
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
      '.yaml': file => this.yaml.toJSON(file),
      '.yml': file => this.yaml.toJSON(file),
      '.xml': file => this.xml.toJSON(file),
      ...this.extendParser
    })[extension]
    // Collect data from file
    let data = {}
    try {
      data = await parser(file)
    } catch (err) {
      logger.warn(`Could not parse ${path.replace(this.cwd, '.')}:`, err.message)
      return null
    }
    // Normalize path without dir and ext
    const normalizedPath = this.normalizePath(path)
    // Extract dir from path
    const split = normalizedPath.split('/')
    const dir = split.slice(0, split.length - 1).join('/')

    // Overrides createdAt & updatedAt if it exists in the document
    const existingCreatedAt = data.createdAt && new Date(data.createdAt)
    const existingUpdatedAt = data.updatedAt && new Date(data.updatedAt)
    // validate the existing dates to avoid wrong date format or typo
    const isValidDate = (date) => {
      return date instanceof Date && !isNaN(date)
    }

    return {
      ...data,
      dir: dir || '/',
      path: normalizedPath,
      extension,
      slug: split[split.length - 1],
      createdAt: isValidDate(existingCreatedAt) ? existingCreatedAt : stats.birthtime,
      updatedAt: isValidDate(existingUpdatedAt) ? existingUpdatedAt : stats.mtime
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

    this.callHook('file:updated', { event, path })
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
