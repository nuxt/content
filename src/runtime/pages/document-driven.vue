<script setup lang="ts">
import { useContent, useContentHead } from '#imports'

const { page } = useContent()

useContentHead(page)
</script>

<template>
  <div class="document-driven-page">
    <NuxtLayout :name="page?.layout || 'default'">
      <ContentRenderer v-if="page" :key="page._id" :value="page">
        <template #empty="{ value }">
          <DocumentDrivenEmpty :value="value" />
        </template>
      </ContentRenderer>
      <DocumentDrivenNotFound v-else />
    </NuxtLayout>
  </div>
</template>
