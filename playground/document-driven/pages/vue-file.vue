<script setup>
definePageMeta({
  layout: 'reversed'
})

const { page } = useContent()
useContentHead(page)
</script>

<template>
  <ContentRenderer :value="page" />
</template>
