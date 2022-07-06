<script setup>
definePageMeta({
  documentDriven: {
    surround: false
  }
})

const { page } = useContent()
useContentHead(page)
</script>

<template>
  <NuxtLayout name="reversed">
    <ContentRenderer :value="page" />
  </NuxtLayout>
</template>
