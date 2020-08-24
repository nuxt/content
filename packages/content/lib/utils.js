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

const mergeConfig = (content, defaults, options = {}) => {
  return Object.entries(content).reduce((options, [key, value]) => {
    const defaultValue = defaults[key]
    if (value && typeof value !== 'function' && Array.isArray(defaultValue)) {
      // Merge value with default value if array
      value = defaultValue.concat(value)
    } else if (typeof value === 'function' && defaultValue) {
      // Executed value functions and provide default value as param
      value = value(defaultValue)
    } else if (typeof value === 'object') {
      value = mergeConfig(value, defaultValue || {}, options[key])
    }

    // Finally assign
    options[key] = value
    return options
  }, options)
}

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
  mergeConfig,
  processMarkdownOptions
}
