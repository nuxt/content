<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :id="id" :document="page" :class="classes" />
    <AppLangSwitcher />
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import AppLayout from '../components/AppLayout'
import AppLangSwitcher from '../components/AppLangSwitcher'

// It is needed for rendering custom highlighter with shiki twoslash
import DataLsp from '../components/DataLsp'
import DataErr from '../components/DataErr'

export default {
  components: {
    AppLayout,
    AppLangSwitcher,
    DataLsp,
    DataErr
  },
  async asyncData ({ $content, app, query, params, error }) {
    const id = query.withId ? 'my-id' : undefined
    const classes = query.withClass ? 'my-class' : undefined
    const path = `/${app.i18n.locale}/${params.pathMatch || 'home'}`
    const page = await $content({ deep: true }).where({ path }).fetch()

    return {
      page,
      id,
      classes
    }
  }
}
</script>
