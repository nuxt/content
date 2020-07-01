<template>
  <div class="flex flex-wrap-reverse">
    <div
      class="w-full py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-r"
      :class="{ '': doc.toc && doc.toc.length, 'lg:w-3/4': !doc.fullscreen }"
    >
      <article class="lg:px-8">
        <h1 class="text-4xl font-black mb-4 leading-none">{{ doc.title }}</h1>
        <nuxt-content :document="doc" />
      </article>
      <EditOnGithub :document="doc" />
      <ArticlePrevNext :prev="prev" :next="next" class="lg:px-8 mt-4" />
    </div>
    <ArticleToc v-if="doc.toc && doc.toc.length" :toc="doc.toc" />
  </div>
</template>

<script>
// import Prism from 'prismjs'
// import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'

export default {
  name: 'PageSlug',
  middleware ({ params, redirect }) {
    if (params.slug === 'index') {
      redirect('/')
    }
  },
  async asyncData ({ $content, store, app, params, error }) {
    const slug = params.slug || 'index'

    let doc
    try {
      doc = await $content(app.i18n.locale, slug).fetch()
    } catch (e) {
      return error({ statusCode: 404, message: 'Page not found' })
    }

    const [prev, next] = await $content(app.i18n.locale)
      .only(['title', 'slug'])
      .sortBy('position', 'asc')
      .surround(slug, { before: 1, after: 1 })
      .fetch()

    return {
      doc,
      prev,
      next
    }
  },
  // mounted () {
  //   const blocks = document.getElementsByClassName('nuxt-content-highlight')

  //   for (let i = 0; i < blocks.length; i++) {
  //     const button = document.createElement('button')
  //     button.className = 'copy-button'
  //     button.textContent = 'Copy'

  //     blocks[i].appendChild(button)
  //   }
  //   // Prism.highlightAll()
  // },
  head () {
    return {
      title: this.doc.title,
      meta: [
        { hid: 'description', name: 'description', content: this.doc.description },
        // Open Graph
        { hid: 'og:title', property: 'og:title', content: this.doc.title },
        { hid: 'og:description', property: 'og:description', content: this.doc.description },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.doc.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.doc.description }
      ]
    }
  }
}
</script>
