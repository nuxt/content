<template>
  <div>
    <h1>{{ page.title }}</h1>

    <nuxt-content :body="page.body" />
  </div>
</template>

<script>

export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fetch()

    return {
      page
    }
  }
}
</script>
