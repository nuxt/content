<script setup lang="ts">
import { useContent, useContentHead } from '#imports'

const { page } = useContent()
const currentPage = page.value

useContentHead(page)
</script>

<template>
  <div class="document-driven-page">
    <NuxtLayout v-if="currentPage" :name="currentPage.layout || 'default'">
      <ContentRenderer :key="currentPage._id" :value="currentPage">
        <template #empty="{ value }">
          <DocumentDrivenEmpty :value="value" />
        </template>
      </ContentRenderer>
    </NuxtLayout>
    <DocumentDrivenNotFound v-else />
  </div>
</template>
