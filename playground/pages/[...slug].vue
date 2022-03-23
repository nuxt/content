<template>
  <div>
    <PageNav />

    <hr>

    <Content v-if="page" :id="page.id" />
    <div v-else>
      Not Found!
    </div>

    <PagePrevNext v-if="page" :page="page" />
  </div>
</template>

<script setup lang="ts">
const { data: page } = await useAsyncData('page-content', async () => {
  const route = useRoute()

  const { findOne } = useContentQuery().where({
    slug: route.path
  })

  return await findOne()
})
</script>
