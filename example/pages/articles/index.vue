<template>
  <div>
    <h1>Articles</h1>
    <ul>
      <li v-for="{ path, metdata } in articles" :key="path">
        <n-link :to="path">{{ metdata.title }}</n-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const articles = await $content('articles').data()

    return { articles }
  }
}
</script>
