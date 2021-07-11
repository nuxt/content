<template>
  <Component :is="page.template" :key="page.template" :page="page" />
</template>

<script>
import Vue from 'vue'
import { withoutTrailingSlash } from 'ufo'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PageSlug',

  middleware({ app, params, redirect }) {
    if (params.pathMatch === 'index') {
      redirect(app.localePath('/'))
    }
  },

  async asyncData({ $docus, app: { i18n, localePath }, params, error, redirect }) {
    const language = i18n.locale

    // Init template options from Docus settings
    let templateOptions = {
      ...$docus.settings.value.layout
    }

    // Get the proper current path
    const to = withoutTrailingSlash(`/${params.pathMatch || ''}`) || '/'

    // TODO: Fix the draft system
    const draft = false

    // Page query
    const [page] = await $docus
      .search({ deep: true })
      .where({ language, to, draft, page: { $ne: false } })
      .fetch()

    // Break on missing page query
    if (!page) {
      return error({ statusCode: 404, message: '404 - Page not found' })
    }

    // Get page template
    page.template = $docus.getPageTemplate(page)

    // Preload the component on client-side navigation
    const component = await Vue.component(page.template)()

    // Set layout defaults for this template
    if (component.templateOptions) {
      templateOptions = { ...templateOptions, ...component.templateOptions }
    }

    // Set layout from page
    if (page.layout) {
      templateOptions = { ...templateOptions, ...page.layout }
    }

    // Set template options
    $docus.layout.value = templateOptions

    // Set Docus runtime current page
    $docus.currentPage.value = page

    // Redirect to another page if `navigation.redirect` is declared
    if (page.navigation && page.navigation.redirect) {
      redirect(localePath(page.navigation.redirect))
    }

    return { page, templateOptions }
  },

  head() {
    const head = {
      title: this.page.title,
      meta: [],
      ...(this.page.head || {})
    }

    this.mergeMeta(head.meta, this.pageMeta)

    return head
  },

  computed: {
    pageMeta() {
      return [
        // OpenGraph
        { hid: 'og:title', property: 'og:title', content: this.page.title },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.page.title },
        /// Page description
        ...(this.page.description
          ? [
              // Meta description
              {
                hid: 'description',
                name: 'description',
                content: this.page.description
              },
              // Open Graph
              {
                hid: 'og:description',
                property: 'og:description',
                content: this.page.description
              },
              // Twitter Card
              {
                hid: 'twitter:description',
                name: 'twitter:description',
                content: this.page.description
              }
            ]
          : [])
      ]
    }
  },

  created() {
    this.$docus.layout.value = this.templateOptions
  },

  mounted() {
    if (this.page?.version) {
      localStorage.setItem(`page-${this.page.slug}-version`, this.page.version)
    }
  },

  methods: {
    mergeMeta(to, from) {
      from.forEach(newMeta => {
        const key = newMeta.hid || newMeta.name || newMeta.property
        const index = to.findIndex(meta => meta.hid === key || meta.name === key || meta.property === key)
        if (index < 0) {
          to.push(newMeta)
        }
      })
    }
  }
})
</script>
