<template>
  <div>
    <PageNav />

    <hr>

    <Content v-if="page" :id="page.id" />
    <div v-else>
      Not Found!
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('page-content', async () => (await useContentQuery().where({ slug: route.path }).fetch()).pop())
</script>
