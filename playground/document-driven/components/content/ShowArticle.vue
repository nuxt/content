<script lang="ts" setup>
import { useAsyncData, queryContent, useContent } from '#imports'

const { data } = await useAsyncData('key', () => queryContent('data').findOne())

const content = useContent()
</script>

<template>
  <h1>Article</h1>

  <h2>data</h2>
  <pre>
    {{ data }}
  </pre>

  <h2>content</h2>
  <pre>
    {{ content }}
  </pre>
</template>
