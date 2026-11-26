<script setup lang="ts">
import type { AnyComarkContent, ContentHub } from 'comark-content'

const { data: page } = await useAsyncData('intro', () => content.get('/docs/intro'))
const probes = ref<string>()

onMounted(() => {
  Object.assign(window, { __content: content })
  const hub = content as unknown as ContentHub<any>
  probes.value = JSON.stringify(Object.fromEntries(hub.names.map((name: string) => [name, (hub.from(name) as AnyComarkContent & { probes?: string[] }).probes])))
})
</script>

<template>
  <div>
    <ContentDocument
      v-if="page"
      :value="page"
    />
    <pre
      v-if="probes"
      id="probes"
    >{{ probes }}</pre>
  </div>
</template>
