<template>
  <div>
    <nuxt-link to="/">Home</nuxt-link>
    <h2 v-html="page.title" />
    <pre>
      {{ page }}
    </pre>
  </div>
</template>

<script>

export default {
  async asyncData ({ $content }) {
    const page = await $content('json').fetch()

    return {
      page
    }
  }
}
</script>
