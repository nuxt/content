<script lang="ts" setup>
const search = ref('')

const result = await useIndexedSearch(search)
</script>

<template>
  <input v-model="search">

  <pre>{{ result }} </pre>
</template>
