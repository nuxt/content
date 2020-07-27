<template>
  <div class="flex flex-wrap-reverse">
    <div
      class="w-full py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-l lg:border-r"
      :class="{ '': doc.toc && doc.toc.length, 'lg:w-3/4': !doc.fullscreen }"
    >
      <article class="prose dark:prose-dark max-w-none lg:px-8">
        <h1>{{ doc.title }}</h1>
        <NuxtContent :document="doc" />
      </article>
      <AppGithubLink :document="doc" />
      <AppPrevNext :prev="prev" :next="next" class="lg:px-8 mt-4" />
    </div>
    <AppToc v-if="doc.toc && doc.toc.length" :toc="doc.toc" />
  </div>
</template>

<script>
import Clipboard from 'clipboard'

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
  mounted () {
    setTimeout(() => {
      const blocks = document.getElementsByClassName('nuxt-content-highlight')

      for (const block of blocks) {
        const button = document.createElement('button')
        button.className = 'copy'
        button.textContent = 'Copy'

        block.appendChild(button)
      }

      const copyCode = new Clipboard('.copy', {
        target (trigger) {
          return trigger.previousElementSibling
        }
      })

      copyCode.on('success', function (event) {
        event.clearSelection()
        event.trigger.textContent = 'Copied!'
        window.setTimeout(function () {
          event.trigger.textContent = 'Copy'
        }, 2000)
      })
    }, 100)
  },
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
