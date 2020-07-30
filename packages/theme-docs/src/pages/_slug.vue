<template>
  <div class="flex flex-wrap-reverse">
    <div
      class="w-full py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-l lg:border-r"
      :class="{ 'lg:w-3/4': !document.fullscreen }"
    >
      <article class="prose dark:prose-dark max-w-none lg:px-8">
        <h1>{{ document.title }}</h1>
        <NuxtContent :document="document" />
      </article>
      <AppGithubLink :document="document" />
      <AppPrevNext :prev="prev" :next="next" />
    </div>
    <AppToc :toc="document.toc" />
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

    let document
    try {
      document = await $content(app.i18n.locale, slug).fetch()
    } catch (e) {
      return error({ statusCode: 404, message: 'Page not found' })
    }

    const [prev, next] = await $content(app.i18n.locale)
      .only(['title', 'slug'])
      .sortBy('position', 'asc')
      .surround(slug, { before: 1, after: 1 })
      .fetch()

    return {
      document,
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
      title: this.document.title,
      meta: [
        { hid: 'description', name: 'description', content: this.document.description },
        // Open Graph
        { hid: 'og:title', property: 'og:title', content: this.document.title },
        { hid: 'og:description', property: 'og:description', content: this.document.description },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.document.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.document.description }
      ]
    }
  }
}
</script>
