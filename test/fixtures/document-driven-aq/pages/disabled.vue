<template>
  <div>
    Document driven is disabled for this page
    <div>page: {{ page }}</div>
    <div>surround: {{ surround }}</div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta, useContent } from '#imports'

definePageMeta({
  documentDriven: false
})

const { page, surround } = useContent()
</script>
