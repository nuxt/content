const { join } = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const chokidar = require('chokidar')
const Loki = require('@lokidb/loki').default
const LokiFullTextSearch = require('@lokidb/full-text-search').default

const { debounce } = require('../utils')
const QueryBuilder = require('./QueryBuilder')

LokiFullTextSearch.register()

class Database {
  constructor (context, options) {
    this.dir = options.dir || process.cwd()
    this.sse = context.sse
    this.markdown = context.markdown
    this.dirs = []
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
    const isDir = !!this.dirs.find(dir => dir === path)
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

      if (stats.isDirectory()) {
        // Store directory in local variable to be checked later
        this.dirs.push(this.normalizePath(path))
        // Walk recursively subfolder
        return this.walk(path)
      } else if (stats.isFile()) {
        // Add file to collection
        return this.process(path)
      }
    }))
  }

  /**
   * Read a file, transform it and insert into collection
   * @param {string} path - The path of the file.
   */
  async process (path) {
    const file = await fs.readFile(path, 'utf-8')
    const { data, content } = matter(file)
    // Compile markdown from file content to JSON
    const body = await this.markdown.toJSON(content)
    // Normalize path without dir and ext
    const normalizedPath = this.normalizePath(path)
    // Extract dir from path
    const split = normalizedPath.split('/')
    const dir = split.slice(0, split.length - 1).join('/')

    this.items.insert({
      ...data,
      dir,
      path: normalizedPath,
      slug: split[split.length - 1],
      body,
      text: content
    })
  }

  /**
   * Remove base dir and extension from file path
   * @param {string} path - The path of the file.
   * @returns {string} Normalized path
   */
  normalizePath (path) {
    return path.replace(this.dir, '').replace(/\.[^/.]+$/, '')
  }

  /**
   * Watch base dir for changes
   */
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

  /**
   * Init database and broadcast change through SSE
   */
  async refresh (event, path) {
    await this.init()

    this.sse.broadcast('change', { event, path })
  }
}

module.exports = Database
