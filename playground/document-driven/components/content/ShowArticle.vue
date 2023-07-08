<script lang="ts" setup>
import { ParsedArticle } from '../../types/article';

const { data } = await useAsyncData('key', () => queryContent('data').findOne())

const content = useContent<ParsedArticle>()

console.log(content.type)
</script>

<template>
  <pre>
    {{ data }}
  </pre>
  <pre>
    {{ content }}
  </pre>
</template>
