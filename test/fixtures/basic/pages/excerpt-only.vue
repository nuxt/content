<template>
  <div>
    <ContentRenderer :value="data!" :excerpt="true" />
  </div>
</template>

<script lang="ts" setup>
import { queryContent, useAsyncData } from '#imports'

const { data } = await useAsyncData('excerpt', () => queryContent('/excerpt').only(['title', 'excerpt']).findOne())
</script>
