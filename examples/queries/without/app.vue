<script setup>
const { data: document } = await useAsyncData('homepage', () => {
  return queryContent('/').without(['title']).findOne()
})
</script>

<template>
  <NuxtExampleLayout example="queries/without" repo="nuxt/content-next">
    <template #icon>
      Nuxt/content
    </template>
    <p>The <code>without(['title'])</code> query excludes <code>title</code> from the returned object</p>
    <ul>
      <li v-for="item in Object.keys(document)" :key="item">
        {{ item }}
      </li>
    </ul>
  </NuxtExampleLayout>
</template>
