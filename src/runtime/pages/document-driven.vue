<script setup lang="ts">
import { useNuxtApp, useContent, useContentHead } from '#imports'

const { page } = useContent()

// Page not found, set correct status code on SSR
const nuxtApp = useNuxtApp()
if (!page.value && process.server && nuxtApp.ssrContext) {
  nuxtApp.ssrContext.res.statusCode = 404
}

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
