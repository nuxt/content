<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :id="id" :document="page" :class="classes" />
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import AppLayout from '../components/AppLayout'

// It is needed for rendering custom highlighter with shiki twoslash
import DataLsp from '../components/DataLsp'
import DataErr from '../components/DataErr'

export default {
  components: {
    AppLayout,
    DataLsp,
    DataErr
  },
  async asyncData ({ $content, params, query }) {
    const id = query.withId ? 'my-id' : undefined
    const classes = query.withClass ? 'my-class' : undefined

    const page = await $content(params.slug || 'home').fetch()

    return {
      page,
      id,
      classes
    }
  }
}
</script>
