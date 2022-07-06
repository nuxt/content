<script setup lang="ts">
import { useContent, useContentHead } from '#imports'

const { page } = useContent()

useContentHead(page)
</script>

<template>
  <div class="document-driven-page">
    <NuxtLayout v-if="page" :name="page.layout || 'default'">
      <ContentRenderer :key="page._id" :value="page">
        <template #empty="{ value }">
          <DocumentDrivenEmpty :value="value" />
        </template>
      </ContentRenderer>
    </NuxtLayout>
    <DocumentDrivenNotFound v-else />
  </div>
</template>
