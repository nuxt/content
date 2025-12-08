<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, (_nuxtApp, { signal }) => {
  return queryCollection('content').path(route.path).first({ signal })
})
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
