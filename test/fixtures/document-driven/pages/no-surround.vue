<template>
  <div>
    Document driven page is disabled for this route
    <div>page: {{ page }}</div>
    <div>surround: {{ surround }}</div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta, useContent } from '#imports'

definePageMeta({
  documentDriven: {
    surround: false
  }
})

const { page, surround } = useContent()
</script>
