<template>
  <div>
    <Content v-if="page" :id="page.id" />
    <div v-else>
      Not Found!
    </div>
    <!-- <PagePrevNext v-if="page" :page="page" /> -->
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData('page-content', () => useContentQuery().where({ slug: route.path }).findOne())
// TODO: find a better way instead of creating new listener
// const nuxtApp = useNuxtApp()
// const { data: page, refresh } = await useAsyncData('page-content', () => useContentQuery().where({ slug: route.path }).findOne())
// nuxtApp.hook('content:update', () => refresh())
</script>
