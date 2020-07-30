export default {
  modules: [
    '@nuxt/content'
  ],
  components: true,
  content: {
    nestedProperties: [
      'categories.slug'
    ],
    extendParser: {
      '.custom': file => ({ body: file.split('\n').map(line => line.trim()) })
    }
  }
}
