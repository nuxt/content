<script>
import Vue from 'vue'
import { withoutTrailingSlash } from 'ufo'
import { defineComponent } from '@nuxtjs/composition-api'
import { useContent, useDocus, useConfig, useNavigation, useLayout, usePage } from '../../context/runtime'

export default defineComponent({
  name: 'PageSlug',

  middleware({ app, params, redirect }) {
    if (params.pathMatch === 'index') redirect(app.localePath('/'))
  },

  async asyncData({ app: { i18n, localePath }, route, params, error, redirect }) {
    const docus = useDocus()
    const $content = useContent()
    const navigation = useNavigation()
    const layout = useLayout()
    const currentPage = usePage()
    const language = i18n.locale

    // Init template options from Docus settings
    let templateOptions = {
      ...layout.value
    }

    // Get the proper current path
    let to = withoutTrailingSlash(`/${params.pathMatch || ''}`) || '/'

    // Replace URL if preview enabled
    if (docus.value.preview) {
      // nuxt-i18n does not preserve encoded components in url so we need to decode preview prefix before replacing
      const prefix = decodeURIComponent(docus.value.preview)
      to = to.replace(new RegExp(`^/${prefix}`), '') || '/'
    }

    // TODO: Implement the draft system
    const draft = false

    // Page query
    const [match] = await $content
      .search({ deep: true })
      .where({ language, to, draft, page: { $ne: false } })
      .fetch()

    // Break on missing page query
    if (!match) return error({ statusCode: 404, message: '404 - Page not found' })

    // Get page data
    const page = await $content.get(match.id)

    // Get page template
    page.template = navigation.getPageTemplate(page)

    // Get page template and merge options & props
    let component = Vue.component(page.template)
    if (component) {
      try {
        if (typeof component === 'function' && !component.options) {
          component = await component()

          if (!component.options) component = Vue.extend(component)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)

        // eslint-disable-next-line new-cap
        component = new component({ props: { page } })
      }

      // Set layout defaults for this template
      if (component.templateOptions || component.$options?.templateOptions) {
        templateOptions = { ...templateOptions, ...(component.templateOptions || component.$options?.templateOptions) }
      }
    }

    // Set layout from page
    if (match.layout) {
      templateOptions = { ...templateOptions, ...match.layout }
    }

    /**
     * It is important to update layout only in server side.
     * Updating layout in client side (here inside `asyncData`) will cause intermediate rendering before page change.
     * and it will cause a layout shifting and unwanted behaviours in navigation.
     */
    if (process.server) {
      // Set template options
      layout.value = templateOptions

      // Set Docus runtime current page
      currentPage.value = page

      // Update navigation path to update currentNav
      navigation.currentPath.value = `/${route.params.pathMatch}`
    }

    // Redirect to another page if `navigation.redirect` is declared
    if (page.navigation && page.navigation.redirect) {
      redirect(localePath(page.navigation.redirect))
    }

    return { page, templateOptions, preview: docus.value.preview }
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
      // Get site title from Docus settings
      const { title: siteTitle } = useConfig()

      return [
        // OpenGraph
        { hid: 'og:title', property: 'og:title', content: this.page.title },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.page.title },
        // Apple Web App title
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          content: siteTitle || ''
        },
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
    if (process.client) {
      const layout = useLayout()
      const currentPage = usePage()
      const navigation = useNavigation()

      // Set template options
      layout.value = this.templateOptions

      // Set Docus runtime current page
      currentPage.value = this.page

      // Update navigation path to update currentNav
      navigation.currentPath.value = `/${this.$route.params.pathMatch}`
    }
  },

  mounted() {
    this.$nuxt.$on('docus:content:preview', this.updatePage)
    // This will use to show new bullet in aside navigation
    if (this.page?.version) localStorage.setItem(`page-${this.page.slug}-version`, this.page.version)
  },

  unmounted() {
    this.$nuxt.$off('docus:content:preview', this.updatePage)
  },

  methods: {
    async updatePage({ key }) {
      if (key === this.page?.key) {
        const $content = useContent()
        const updatedPage = await $content.get(this.page.key)
        Object.assign(this.page, updatedPage)
      }
    },
    mergeMeta(to, from) {
      from.forEach(newMeta => {
        const key = newMeta.hid || newMeta.name || newMeta.property
        const index = to.findIndex(meta => meta.hid === key || meta.name === key || meta.property === key)
        if (index < 0) {
          to.push(newMeta)
        }
      })
    }
  },

  render(h) {
    return h(this.page.template, {
      props: {
        page: this.page
      }
    })
  }
})
</script>
