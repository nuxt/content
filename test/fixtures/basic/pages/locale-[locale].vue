<template>
  <pre>{{ ids }}</pre>
</template>

<script setup lang="ts">
const route = useRoute()

const list = await useContentQuery().locale(route.params.locale).find()
const ids = list.map(item => item.id).join('\n')
</script>
