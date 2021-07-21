<template>
  <div class="flex">
    <div class="w-1/4">
      <ul>
        <li v-for="link in navigation.en" :key="link.id">
          <NuxtLink :to="link.to">{{ link.title }}</NuxtLink>
          <ul v-if="link.children">
            <li v-for="child in link.children" :key="child.id">
              <NuxtLink :to="child.to">{{ child.title }}</NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="w-3/4 px-4">
      <DocusContent :document="page" />
    </div>
  </div>
</template>

<script lang="ts">
import { withoutTrailingSlash } from 'ufo'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PageSlug',

  middleware({ app, params, redirect }) {
    if (params.pathMatch === 'index') redirect(app.localePath('/'))
  },

  async asyncData({ $content, app: { i18n, localePath }, params, error, redirect }) {
    const language = i18n.locale

    // Get the proper current path
    const to = withoutTrailingSlash(`/${params.pathMatch || ''}`) || '/'

    // TODO: Fix the draft system
    const draft = false

    // Page query
    const [match] = await $content
      .search({ deep: true })
      .where({ language, to, draft, page: { $ne: false } })
      .fetch()

    // Break on missing page query
    if (!match) return error({ statusCode: 404, message: '404 - Page not found' })

    const page = await $content.get(match.id)

    const { body: navigation } = await $content.get('data:docus:navigation')

    // Get page template --- since we use navigation to fetch the page, we don't need this calculation here
    // page.template = $docus.getPageTemplate(page)

    // // Preload the component on client-side navigation
    // let component = Vue.component(page.template)
    // if (typeof component === 'function' && !component.options) {
    //   component = await component()
    //   if (!component.options) {
    //     component = Vue.extend(component)
    //   }
    // }

    // // // Set layout defaults for this template
    // if (component?.options?.templateOptions) {
    //   templateOptions = { ...templateOptions, ...component.options.templateOptions }
    // }

    // // // Set layout from page
    // if (page.layout) {
    //   templateOptions = { ...templateOptions, ...page.layout }
    // }

    // if (process.server) {
    //   // Set template options
    //   $docus.layout.value = templateOptions

    //   // Set Docus runtime current page
    //   $docus.currentPage.value = page
    //   // Update navigation path to update currentNav
    //   $docus.currentPath.value = `/${params.pathMatch}`
    // }

    // // Redirect to another page if `navigation.redirect` is declared
    if (page.redirect) redirect(localePath(page.redirect))

    return { page, navigation }
  }
})
</script>

<style>
.flex {
  display: flex;
  width: 100%;
}
.w-1/4 {
  width: 25%;
}
.w-3/4 {
  width: 75%;
}
.px-4 {
  padding: 0 2em;
}
</style>
