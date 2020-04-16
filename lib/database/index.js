const { join, extname } = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const chokidar = require('chokidar')
const csv = require('csvtojson')
const Loki = require('@lokidb/loki').default
const LokiFullTextSearch = require('@lokidb/full-text-search').default

const { debounce } = require('../utils')
const QueryBuilder = require('./query-builder')

LokiFullTextSearch.register()

class Database {
  constructor (context, options) {
    this.dir = options.dir || process.cwd()
    this.sse = context.sse
    this.markdown = context.markdown
    this.nuxt = context.nuxt
    // Create Loki database
    this.db = new Loki('content.db')
    // Add text to search fields
    options.fullTextSearchFields = options.fullTextSearchFields.concat('text')
    // Init collection
    this.items = this.db.addCollection('items', { unique: ['path'], fullTextSearch: options.fullTextSearchFields.map(field => ({ field })) })
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
      postprocess
    }, this.options)
  }

  /**
   * Clear items in database and load files into collection
   */
  async init () {
    this.dirs = ['/']
    this.items.clear()

    await this.walk(this.dir)
  }

  /**
   * Walk dir tree recursively
   * @param {string} dir - Directory to browse.
   */
  async walk (dir) {
    const files = await fs.readdir(dir)

    await Promise.all(files.map(async (file) => {
      const path = join(dir, file)
      const stats = await fs.stat(path)

      /* istanbul ignore else */
      if (stats.isDirectory()) {
        // Store directory in local variable to be checked later
        this.dirs.push(this.normalizePath(path))
        // Walk recursively subfolder
        return this.walk(path)
      } else if (stats.isFile()) {
        // Add file to collection
        return this.processFile(path)
      }
    }))
  }

  /**
   * Read a file, transform it and insert into collection
   * @param {string} path - The path of the file.
   */
  async processFile (path) {
    const file = await fs.readFile(path, 'utf-8')

    await this.nuxt.callHook('content:file:beforeParsing', file)

    // Get file data depending on extension
    let data
    const fn = ({
      '.md': this.parseMarkdownFile,
      '.json': this.parseJsonFile,
      '.csv': this.parseCsvFile
    })[extname(path)]
    if (fn) {
      data = await fn.call(this, file)
    }

    // Normalize path without dir and ext
    const normalizedPath = this.normalizePath(path)
    // Extract dir from path
    const split = normalizedPath.split('/')
    const dir = split.slice(0, split.length - 1).join('/')

    const item = {
      ...data,
      dir: dir || '/',
      path: normalizedPath,
      slug: split[split.length - 1]
    }

    await this.nuxt.callHook('content:file:beforeInsert', item)

    this.items.insert(item)
  }

  async parseMarkdownFile (file) {
    const { data, content } = matter(file)

    // Compile markdown from file content to JSON
    const body = await this.markdown.toJSON(content)
    // Generate toc from body
    const toc = this.generateToc(body)

    return {
      ...data,
      toc,
      body,
      text: content
    }
  }

  parseJsonFile (file) {
    return JSON.parse(file)
  }

  async parseCsvFile (file) {
    const body = await csv({ output: 'json' }).fromString(file)

    return {
      body
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

  generateToc (body) {
    return body.children.filter(node => ['h2', 'h3'].includes(node.tag)).map((node) => {
      const id = node.props.id
      const depth = ({
        h2: 2,
        h3: 3
      })[node.tag]
      const text = node.children.find(child => child.type === 'text')

      return {
        id,
        depth,
        text: text.value
      }
    })
  }

  /**
   * Watch base dir for changes
   */
  /* istanbul ignore next */
  watch () {
    this.watcher = chokidar.watch(['**/*'], {
      cwd: this.dir,
      ignoreInitial: true,
      ignored: 'node_modules/**/*'
    })
      .on('change', debounce(path => this.refresh('change', path), 200))
      .on('add', debounce(path => this.refresh('add', path), 200))
      .on('unlink', debounce(path => this.refresh('unlink', path), 200))
  }

  /**
   * Init database and broadcast change through SSE
   */
  /* istanbul ignore next */
  async refresh (event, path) {
    await this.init()

    this.sse.broadcast('change', { event, path })
  }

  /*
  ** Stop database and watcher and clear pointers
  */
  async close () {
    await this.db.close()
    this.db = null

    /* istanbul ignore else */
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
  }
}

module.exports = Database
