<script setup lang="ts">
import { useContent, useContentHead } from '#imports'

const { page } = useContent()

useContentHead(page)
</script>

<template>
  <div class="document-driven-content">
    <ContentRenderer v-if="page" :key="page._id" :value="page">
      <template #empty="{ value }">
        <DocumentDrivenEmpty :value="value" />
      </template>
    </ContentRenderer>

    <DocumentDrivenNotFound v-else />
  </div>
</template>

<style>
.document-driven-content {
  padding: 1rem;
}
</style>
