<script setup>
import { definePageMeta } from '#imports'

definePageMeta({
  documentDriven: {
    page: '/'
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
