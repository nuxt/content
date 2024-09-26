<script setup lang="ts">
import { queryCollection } from '../src/runtime/utils/queryCollection'
import { getCollectionSearchSections, useAsyncData } from '#imports'

const { data: navigation } = await useAsyncData('navigation', async () => {
  const res = await getCollectionSearchSections('nuxt_content', { ignoredTags: [] })

  return res.map(item => ({
    ...item,
    id: item.id.split('/').slice(1).join('/').replace(/\/+/g, '/'),
    _id: item.id.split('/').slice(1).join('/').replace(/\/+/g, '/'),
    _path: item.id.split('/').slice(1).join('/').replace(/\/+/g, '/'),
    path: item.id.split('/').slice(1).join('/').replace(/\/+/g, '/'),
  }))
})
const files = await queryCollection('nuxt_content').all().then(files => files.map(file => ({
  ...file,
  _id: file.contentId,
  _path: file.path,
})))

const links = [{
  label: 'Home',
  icon: 'i-heroicons-book-open',
  to: '/',
}]

provide('navigation', navigation)
provide('files', files)
</script>

<template>
  <!-- <Header :links="links" /> -->

  <NuxtLayout>
    s
    <NuxtPage />
  </NuxtLayout>

  <!-- <Footer /> -->

  <ClientOnly>
    {{ navigation }}
    <UContentSearch
      :files="files"
      :navigation="navigation"
      :links="links"
    />
  </ClientOnly>

  <!-- <UNotifications /> -->
</template>
