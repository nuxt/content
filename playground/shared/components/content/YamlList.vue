<template>
  <div>
    <hr>
    <pre>{{ list }}</pre>
    <hr>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, queryContent } from '#imports'

const { data: list } = await useAsyncData('yaml-list', () => queryContent('yaml').find())
</script>
