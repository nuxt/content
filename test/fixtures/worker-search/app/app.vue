<script setup lang="ts">
const { data: page } = await useAsyncData('install', () => content.get('/docs/en/install'))
// As Docus does with the current locale's source.
const instances = ref(['docs'])
const { status, warmup, search, get } = useNuxtContentWorker({ instances })

// Hydrate the worker once the page is idle, so the first query is answered from a ready index.
onNuxtReady(warmup)
onMounted(() => Object.assign(window, {
  __worker: { search, get, instances },
  // Never called: Vite bundles it all the same.
  __otherWorker: () => new Worker(new URL('./other.worker.ts', import.meta.url), { type: 'module' }),
}))
</script>

<template>
  <div>
    <ContentDocument
      v-if="page"
      :value="page"
    />
    <p id="status">
      {{ status }}
    </p>
  </div>
</template>
