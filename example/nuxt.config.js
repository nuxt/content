export default {
  modules: [
    '@nuxt/content'
  ],
  components: true,
  hooks: {
    'content:file:beforeInsert': async (document, database) => {
      if (document.extension === '.json' && document.body) {
        const data = await database.markdown.toJSON(document.body)

        Object.assign(document, data)
      }
    }
  },
  content: {
    nestedProperties: [
      'categories.slug'
    ],
    extendParser: {
      '.custom': file => ({ body: file.split('\n').map(line => line.trim()) })
    }
  }
}
