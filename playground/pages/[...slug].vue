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
const route = useRoute()

const { findOne } = useContentQuery(route.path)

const { data: page } = await useAsyncData('page-content', findOne)
</script>
