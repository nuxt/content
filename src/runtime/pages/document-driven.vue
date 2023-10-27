<script setup lang="ts">
import { useRuntimeConfig } from '#app'
import type { LayoutKey } from '#build/types/layouts'
import { useContent, useContentHead, useRequestEvent } from '#imports'

const { contentHead } = useRuntimeConfig().public.content
const { page, layout } = useContent()

// Page not found, set correct status code on SSR
if (!(page as any).value && process.server) {
  const event = useRequestEvent()
  event.res.statusCode = 404
}

if (contentHead) {
  useContentHead(page)
}
</script>

<template>
  <div class="document-driven-page">
    <NuxtLayout :name="layout as LayoutKey || 'default'">
      <ContentRenderer v-if="page" :key="(page as any)._id" :value="page">
        <template #empty="{ value }">
          <DocumentDrivenEmpty :value="value" />
        </template>
      </ContentRenderer>
      <DocumentDrivenNotFound v-else />
    </NuxtLayout>
  </div>
</template>
