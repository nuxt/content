<script setup lang="ts">
// const { data: navigation } = await useAsyncData('navigation', async () => {
//   const res = await queryCollectionSearchSections('nuxt_content', { ignoredTags: [] })

//   return res.map(item => ({
//     ...item,
//     id: item.id,
//     _id: item.id,
//     _path: item.id,
//     path: item.id,
//   }))
// })
// const files = await queryCollection('nuxt_content').all().then(files => files.map(file => ({
//   ...file,
//   _id: file.contentId,
//   _path: file.path,
// })))

// const links = [{
//   label: 'Home',
//   icon: 'i-heroicons-book-open',
//   to: '/',
// }]

// provide('navigation', navigation)
// provide('files', files)
</script>

<template>
  <!-- <Header :links="links" /> -->

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- <Footer /> -->

  <ClientOnly>
    <!-- <UContentSearch
      :files="files"
      :navigation="navigation"
      :links="links"
    /> -->
  </ClientOnly>
  <!-- <UNotifications /> -->
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";
</style>
