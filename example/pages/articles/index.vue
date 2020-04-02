<template>
  <div>
    <h1>Articles</h1>
    <ul>
      <li v-for="{ path, metadata } in articles" :key="path">
        <nuxt-link :to="path">{{ metadata.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const articles = await $content('articles').fetch()

    return { articles }
  }
}
</script>
