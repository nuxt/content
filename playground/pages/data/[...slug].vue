<script lang="ts" setup>
const route = useRoute()
const { data } = await useAsyncData('data', () => queryCollection('data').path(`/${route.params.slug}`).first())
</script>

<template>
  <div>
    <pre>{{ data }}</pre>
  </div>
</template>
