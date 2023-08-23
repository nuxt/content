<template>
  <main>
    <ContentRenderer :value="data?.result">
      <Alert>
        The default slot is overridden.
      </Alert>
      <ContentRendererMarkdown :value="data?.result" />
      <template #empty>
        <p>No content found.</p>
      </template>
    </ContentRenderer>
  </main>
</template>

<script setup lang="ts">
import { queryContent, useAsyncData } from '#imports'

const path = '/'
const { data } = await useAsyncData(`content-${path}`, () => queryContent().where({ _path: path, draft: { $ne: true } }).findOne())
</script>
