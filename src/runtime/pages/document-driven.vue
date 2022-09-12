<script setup lang="ts">
import { useContent, useContentHead, useRequestEvent } from '#imports'

const { page, layout } = useContent()

// Page not found, set correct status code on SSR
if (!page.value && process.server) {
  const event = useRequestEvent()
  event.res.statusCode = 404
}

useContentHead(page)
</script>

<template>
  <div class="document-driven-page">
    <NuxtLayout :name="layout || 'default'">
      <ContentRenderer v-if="page" :key="page._id" :value="page">
        <template #empty="{ value }">
          <DocumentDrivenEmpty :value="value" />
        </template>
      </ContentRenderer>
      <DocumentDrivenNotFound v-else />
    </NuxtLayout>
  </div>
</template>
