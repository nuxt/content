const getDefaults = options => ({
  watch: options.dev,
  apiPrefix: '_content',
  dir: 'content',
  fullTextSearchFields: ['title', 'description', 'slug', 'text'],
  markdown: {
    remarkPlugins: [
      'remark-squeeze-paragraphs',
      'remark-slug',
      'remark-autolink-headings',
      'remark-external-links',
      'remark-footnotes'
    ],
    rehypePlugins: [
      'rehype-minify-whitespace',
      'rehype-sort-attribute-values',
      'rehype-sort-attributes',
      'rehype-raw'
    ],
    remarkExternalLinks: {},
    remarkFootnotes: {
      inlineNotes: true
    },
    prism: {
      theme: 'prismjs/themes/prism.css'
    }
  },
  yaml: {},
  csv: {}
})

const mergeConfig = (content, defaults, options = {}) => {
  return Object.entries(content).reduce((options, [key, value]) => {
    const defaultValue = defaults[key]
    if (value && typeof value !== 'function' && Array.isArray(defaultValue)) {
      // Merge value with default value if array
      value = defaultValue.concat(value)
    } else if (typeof value === 'function') {
      // Executed value functions and provide default value as param
      value = value(defaultValue)
    } else if (typeof value === 'object') {
      value = mergeConfig(value, defaultValue, options[key])
    }

    // Finally assign
    options[key] = value
    return options
  }, options)
}

module.exports = {
  getDefaults,
  mergeConfig
}
