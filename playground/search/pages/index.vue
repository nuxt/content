<script lang="ts" setup>
const search = ref('')
const result = await useSearch(search)
</script>

<template>
  <div>
    <h1>Search</h1>
    <p>Search page</p>

    <input v-model="search">

    <pre>{{ result }} </pre>
  </div>
</template>
