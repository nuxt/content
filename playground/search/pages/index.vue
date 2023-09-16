<script lang="ts" setup>
const open = ref(false)
</script>

<template>
  <div>
    <h1>Search</h1>

    <button @click="open = !open">
      {{ open ? 'Close' : 'Open' }} Search
    </button>

    <Search v-if="open" />

    <Search />
  </div>
</template>
