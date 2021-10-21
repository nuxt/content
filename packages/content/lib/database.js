const { join, extname } = require('path')
const fs = require('graceful-fs').promises
const mkdirp = require('mkdirp')
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
    this.srcDir = options.srcDir || process.cwd()
    this.buildDir = options.buildDir || process.cwd()
    this.useCache = options.useCache || false
    this.markdown = new Markdown(options.markdown)
    this.yaml = new YAML(options.yaml)
    this.csv = new CSV(options.csv)
    this.xml = new XML(options.xml)
    // Create Loki database
    this.db = new Loki('content.db')
    // Init collection
    this.itemsCollectionOptions = {
      fullTextSearch: options.fullTextSearchFields.map(field => ({ field })),
      nestedProperties: options.nestedProperties
    }
    this.items = this.db.addCollection('items', this.itemsCollectionOptions)
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

  async init () {
    if (this.useCache) {
      try {
        return await this.initFromCache()
      } catch (error) {}
    }

    await this.initFromFilesystem()
  }

  /**
   * Clear items in database and load files into collection
   */
  async initFromFilesystem () {
    const startTime = process.hrtime()
    this.dirs = ['/']
    this.items.clear()
    await this.walk(this.dir)
    const [s, ns] = process.hrtime(startTime)
    logger.info(`Parsed ${this.items.count()} files in ${s}.${Math.round(ns / 1e8)} seconds`)
  }

  async initFromCache () {
    const startTime = process.hrtime()
    const cacheFilePath = join(this.buildDir, this.db.filename)
    const cacheFileData = await fs.readFile(cacheFilePath, 'utf-8')
    const cacheFileJson = JSON.parse(cacheFileData)

    this.db.loadJSONObject(cacheFileJson)

    // recreate references
    this.items = this.db.getCollection('items')
    this.dirs = this.items.mapReduce(doc => doc.dir, dirs => [...new Set(dirs)])

    const [s, ns] = process.hrtime(startTime)
    logger.info(`Loaded ${this.items.count()} documents from cache in ${s},${Math.round(ns / 1e8)} seconds`)
  }

  /**
   * Store database info file
   * @param {string} [dir] - Directory containing database dump file.
   * @param {string} [filename] - Database dump filename.
   */
  async save (dir, filename) {
    dir = dir || this.buildDir
    filename = filename || this.db.filename

    await mkdirp(dir)
    await fs.writeFile(join(dir, filename), this.db.serialize(), 'utf-8')
  }

  async rebuildCache () {
    logger.info('Rebuilding content cache')
    this.db = new Loki('content.db')
    this.items = this.db.addCollection('items', this.itemsCollectionOptions)
    await this.initFromFilesystem()
    await this.save()
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
    const items = await this.parseFile(path)

    if (!items) {
      return
    }

    // Assume path is a directory if returning an array
    if (items.length > 1) {
      this.dirs.push(this.normalizePath(path))
    }

    for (const item of items) {
      await this.callHook('file:beforeInsert', item)

      this.items.insert(item)
    }
  }

  /**
   * Update file in collection
   * @param {string} path - The path of the file.
   */
  async updateFile (path) {
    const items = await this.parseFile(path)

    if (!items) {
      return
    }

    for (const item of items) {
      await this.callHook('file:beforeInsert', item)

      const document = this.items.findOne({ path: item.path })

      logger.info(`Updated ${path.replace(this.srcDir, '.')}`)
      if (document) {
        this.items.update({ $loki: document.$loki, meta: document.meta, ...item })
        return
      }
      this.items.insert(item)
    }
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
    // If unknown extension, skip
    if (!EXTENSIONS.includes(extension) && !this.extendParserExtensions.includes(extension)) {
      return
    }

    const stats = await fs.stat(path)
    const file = {
      path,
      extension,
      data: await fs.readFile(path, 'utf-8')
    }

    await this.callHook('file:beforeParse', file)

    // Get parser depending on extension
    const parser = ({
      '.json': data => JSON.parse(data),
      '.json5': data => JSON5.parse(data),
      '.md': data => this.markdown.toJSON(data),
      '.csv': data => this.csv.toJSON(data),
      '.yaml': data => this.yaml.toJSON(data),
      '.yml': data => this.yaml.toJSON(data),
      '.xml': data => this.xml.toJSON(data),
      ...this.extendParser
    })[extension]

    // Collect data from file
    let data = []
    try {
      data = await parser(file.data, { path: file.path })
      // Force data to be an array
      data = Array.isArray(data) ? data : [data]
    } catch (err) {
      logger.warn(`Could not parse ${path.replace(this.srcDir, '.')}:`, err.message)
      return null
    }

    // Normalize path without dir and ext
    const normalizedPath = this.normalizePath(path)

    // Validate the existing dates to avoid wrong date format or typo
    const isValidDate = (date) => {
      return date instanceof Date && !isNaN(date)
    }

    return data.map((item) => {
      const paths = normalizedPath.split('/')
      // `item.slug` is necessary with JSON arrays since `slug` comes from filename by default
      if (data.length > 1 && item.slug) {
        paths.push(item.slug)
      }
      // Extract `dir` from paths
      const dir = paths.slice(0, paths.length - 1).join('/') || '/'
      // Extract `slug` from paths
      const slug = paths[paths.length - 1]
      // Construct full path
      const path = paths.join('/')

      // Overrides createdAt & updatedAt if it exists in the document
      const existingCreatedAt = item.createdAt && new Date(item.createdAt)
      const existingUpdatedAt = item.updatedAt && new Date(item.updatedAt)

      return {
        slug,
        // Allow slug override
        ...item,
        dir,
        path,
        extension,
        createdAt: isValidDate(existingCreatedAt) ? existingCreatedAt : stats.birthtime,
        updatedAt: isValidDate(existingUpdatedAt) ? existingUpdatedAt : stats.mtime
      }
    })
  }

  /**
   * Remove base dir and extension from file path
   * @param {string} path - The path of the file.
   * @returns {string} Normalized path
   */
  normalizePath (path) {
    let extractPath = path.replace(this.dir, '')
    const extensionPath = extractPath.substr(extractPath.lastIndexOf('.'))
    const additionalsExt = EXTENSIONS.concat(this.extendParserExtensions)

    // Remove the extension from the path if contained at the end or starts with a dot
    if (additionalsExt.includes(extensionPath) || extractPath.startsWith('.')) {
      extractPath = extractPath.replace(/(?:\.([^.]+))?$/, '')
    }

    return extractPath.replace(/\\/g, '/')
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
