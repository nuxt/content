<script lang="ts" setup>
const { data } = await useAsyncData('posts', () => queryContent('/real-content/post').where({ authors: { $contains: '' } }).find())
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
