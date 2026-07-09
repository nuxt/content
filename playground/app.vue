<template>
  <div style="display: flex">
    <pre style="flex: 1">{{ navigation }}</pre>
    <div style="flex: 2">
      <ContentRenderer
        v-if="page"
        :tree="page"
        :components="{
          a: NuxtLink,
        }"
      />
      <div v-else>
        Not Found
      </div>
    </div>

    <pre style="flex: 2">{{ surround }}</pre>
  </div>
</template>

<script setup>
import { NuxtLink } from '#components'

const route = useRoute()

const { data: page } = await useAsyncData(() => route.path, () => {
  return cms.get(route.path)
})

const { data: navigation } = await useAsyncData(() => 'nav-' + route.path, () => {
  return queryCollectionNavigation('default')
})
const { data: surround } = await useAsyncData(() => 'surround-' + route.path, () => {
  return queryCollectionItemSurroundings('default', route.path)
})
onMounted(() => {
  window.cms = cms
})
</script>
