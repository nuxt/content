<template>
  <div>
    <div v-if="preview" class="preview-bar">Preview Mode</div>
    <div class="flex p-2">
      <div class="w-25">
        <button @click="togglePreviewMode">Toggle Preview Mode</button>
        <ul>
          <li v-for="link in navigation.en" :key="link.id">
            <NuxtLink v-if="link.page" :to="link.to">{{ link.title }}</NuxtLink>
            <span v-else>{{ link.title }}</span>
            <ul v-if="link.children">
              <li v-for="child in link.children" :key="child.id">
                <NuxtLink v-if="child.page" :to="child.to">{{ child.title }}</NuxtLink>
                <span v-else>{{ child.title }}</span>
              </li>
            </ul>
          </li>
        </ul>
        <button v-if="preview" @click="randomContent">+ Generate Random Content</button>
      </div>
      <div class="w-75 px-4">
        <DocusContent :document="page" />
      </div>
    </div>
  </div>
</template>

<script>
import { withoutTrailingSlash } from 'ufo'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PageSlug',

  middleware({ app, params, redirect }) {
    if (params.pathMatch === 'index') redirect(app.localePath('/'))
  },

  async asyncData({ $content, params, error, ssrContext, $config }) {
    // const language = i18n.locale

    // Get the proper current path
    let to = withoutTrailingSlash(`/${params.pathMatch || ''}`) || '/'

    const preview = $config?._app?.basePath === '/_preview/' || to.startsWith('/_preview')
    if (preview) {
      $config?._app?.basePath = '/_preview/'
      ssrContext?.runtimeConfig?.public?._app?.basePath = '/_preview/'
      to = to.replace(/^\/_preview/, '') || '/'
      $content = $content.preview()
    } else {
      $config?._app?.basePath = '/'
      ssrContext?.runtimeConfig?.public?._app?.basePath = '/'
    }

    // TODO: Fix the draft system
    const draft = false

    // Page query
    const [match] = await $content
      .search({ deep: true })
      .where({ to, draft, page: { $ne: false } })
      .fetch()

    // Break on missing page query
    if (!match) return error({ statusCode: 404, message: '404 - Page not found' })

    const page = await $content.get(match.id)

    const navigation = await $content.fetch('navigation')

    return { preview, page, navigation }
  },
  methods: {
    togglePreviewMode() {
      if (this.preview) {
        this.$router.replace(this.$route.fullPath.replace(/^\/_preview/, '') || '/')
        this.$config?._app?.basePath = '/preview/'
      } else {
        this.$config?._app?.basePath = '/'
        this.$router.replace('/_preview' + this.$route.fullPath)
      }
    },
    async randomContent() {
      const id = parseInt(Math.random() * 10e4)
      console.log('ID generated')
      const $preview = this.$content.preview()
      await $preview.setItem('content:random-conten-t' + id + '.md', `# Random Content #${id}

        Hello 👋

        I just got modified

    `)
      console.log('Document Added')
      console.log('Fetching new navigation', this.preview)
      const $content = this.preview ? this.$content.preview() : this.$content
      const navigation = await $content.fetch('navigation')
      console.log('Navigation loaded')
      this.navigation = navigation
      console.log('Navigation updated')
    }
  }
})
</script>

<style>
body {
  margin: 0;
}
.flex {
  display: flex;
  width: 100%;
}
.w-25 {
  width: 25%;
}
.w-75 {
  width: 75%;
}
.px-4 {
  padding: 0 2em;
}
.p-2 {
  padding: 1rem;
}
.preview-bar {
  background: #34a4ff;
  text-align: center;
  padding: 4px;
}
</style>
