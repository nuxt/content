<script lang="ts" setup>
const search = ref('')

// Usage for indexed search
// const options = defineMiniSearchOptions({
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
// const result = await useSearch(search, options)

// Usage for indexed search
const result = await useSearch(search)
</script>

<template>
  <input v-model="search">

  <pre>{{ result }} </pre>
</template>
