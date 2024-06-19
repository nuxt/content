<script lang="ts" setup>
import { ref } from '#imports'
const search = ref('')

// Usage for non indexed search
// const miniSearch = defineMiniSearchOptions({
//   fields: ['title', 'content', 'titles'],
//   storeFields: ['title', 'content', 'titles'],
//   searchOptions: {
//     prefix: true,
//     fuzzy: 0.2,
//     boost: {
//       title: 4,
//       content: 2,
//       titles: 1
//     }
//   }
// })
// const result = await searchContent(search, { miniSearch })

// Usage for indexed search
// @ts-expect-error - TODO: fix this
const result = await searchContent(search)
</script>

<template>
  <input v-model="search">

  <pre>{{ result }}</pre>
</template>
