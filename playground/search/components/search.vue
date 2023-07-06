<script lang="ts" setup>
const search = ref('')

const options =
  {
    fuseOptions: {
      keys: [
        'title'
      ],
      ignoreLocation: true,
      threshold: 0,
      includeMatches: true
    },
    matchAllWhenSearchEmpty: true
  }

const result = await useSearch(search, options)
</script>

<template>
  <input v-model="search">

  <pre>{{ result }} </pre>
</template>
