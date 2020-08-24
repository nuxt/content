const logger = require('consola').withScope('@nuxt/content')
const { camelCase } = require('change-case')

const getDefaults = ({ dev = false } = {}) => ({
  editor: './editor.vue',
  watch: dev,
  liveEdit: true,
  apiPrefix: '_content',
  dir: 'content',
  fullTextSearchFields: ['title', 'description', 'slug', 'text'],
  nestedProperties: [],
  markdown: {
    remarkPlugins: [
      'remark-squeeze-paragraphs',
      'remark-slug',
      'remark-autolink-headings',
      'remark-external-links',
      'remark-footnotes'
    ],
    rehypePlugins: [
      'rehype-sort-attribute-values',
      'rehype-sort-attributes',
      'rehype-raw'
    ],
    prism: {
      theme: 'prismjs/themes/prism.css'
    }
  },
  yaml: {},
  csv: {},
  xml: {},
  extendParser: {}
})

const processMarkdownPlugins = (type, markdown, resolvePath) => {
  const plugins = []

  for (const plugin of markdown[`${type}Plugins`]) {
    let name
    let options
    let instance

    if (typeof plugin === 'string') {
      name = plugin
      options = markdown[camelCase(name)]
    } else if (Array.isArray(plugin)) {
      [name, options] = plugin
    }

    try {
      instance = require(resolvePath(name))

      plugins.push({ instance, name, options })
    } catch (e) {
      logger.error(e.toString())
    }
  }

  return plugins
}

const processMarkdownOptions = (options, resolvePath) => {
  if (!resolvePath) {
    resolvePath = path => path
  }
  options.markdown.remarkPlugins = processMarkdownPlugins('remark', options.markdown, resolvePath)
  options.markdown.rehypePlugins = processMarkdownPlugins('rehype', options.markdown, resolvePath)
}

module.exports = {
  getDefaults,
  processMarkdownOptions
}
