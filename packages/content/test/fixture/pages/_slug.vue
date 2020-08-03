<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :id="id" :document="page" :class="classes" />
  </div>
</template>

<script>
import AppLayout from '../components/AppLayout'

export default {
  components: {
    AppLayout // eslint-disable-line vue/no-unused-components
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
