<script setup>
const { data } = await useAsyncData('homepage', () => {
  return queryContent('/').without(['title']).findOne()
})
</script>

<template>
  <NuxtExampleLayout example="queries/without" repo="nuxt/content">
    <p>The <code>without(['title'])</code> query excludes <code>title</code> from the returned object</p>
    <ul>
      <li v-for="item in Object.keys(data)" :key="item">
        {{ item }}
      </li>
    </ul>
  </NuxtExampleLayout>
</template>
