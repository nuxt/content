<template>
  <div>
    <pre>{{ content }}</pre>
  </div>
</template>

<script setup>
import { useContent } from '#docus'
const content = await useContent('content:example:lorem.md')
</script>
