<template>
  <pre>{{ ids }}</pre>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: list } = await useAsyncData(route.path, () => queryContent().locale(route.params.locale).find())
const ids = computed(() => list.value.map(item => item.$id).join('\n'))
</script>
