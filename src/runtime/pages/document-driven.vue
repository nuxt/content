<script setup lang="ts">
import { useContent, useContentHead } from '#imports'

const { page } = useContent()
const currentPage = ref(page.value)

watch(page, (v) => {
  if (v._id === currentPage.value._id) {
    currentPage.value = v
  }
})

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
