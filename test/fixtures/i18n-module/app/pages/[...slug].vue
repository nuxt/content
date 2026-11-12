<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

const path = computed(() => `/${[route.params.slug ?? []].flat().join('/')}`)

const { data: page } = await useAsyncData(
  () => `page:${locale.value}:${path.value}`,
  () => queryCollection('docs').path(path.value).first(),
)
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
