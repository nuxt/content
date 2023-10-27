<script lang="ts" setup>
import type { ParsedArticle } from '../../types/article'

const { data } = await useAsyncData('key', () => queryContent('data').findOne())

const content = useContent<ParsedArticle>()
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
