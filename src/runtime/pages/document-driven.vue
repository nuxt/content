<script setup lang="ts">
import { throwError } from '#app'
import { createError } from 'h3'
import { useContent, useContentHead } from '#imports'

const { page } = useContent()

// Page not found
if (!page.value) {
  throwError(
    createError({
      statusCode: 404,
      statusMessage: `Page not found: ${useRoute().path}`
    })
  )
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
