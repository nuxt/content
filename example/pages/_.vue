<template>
  <div class="flex">
    <div class="w-25">
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
    </div>
    <div class="w-75 px-4">
      <DocusContent :document="page" />
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

  async asyncData({ $content, app: { _i18n, _localePath }, params, error }) {
    // const language = i18n.locale

    // Get the proper current path
    const to = withoutTrailingSlash(`/${params.pathMatch || ''}`) || '/'

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

    return { page, navigation }
  }
})
</script>

<style>
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
</style>
