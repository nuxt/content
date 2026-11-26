<script setup lang="ts">
const { data: page } = await useAsyncData('install', () => content.get('/docs/en/install'))
// As Docus does with the current locale's source.
const instances = ref(['docs'])
const { status, warmup, search, get } = useNuxtContentWorker({ instances })

// Every value `status` takes: `<UContentSearch>` searches again each time it turns `ready`.
const statuses: string[] = []
watch(status, value => statuses.push(value))

// Hydrate the worker once the page is idle, so the first query is answered from a ready index.
onNuxtReady(warmup)
onMounted(() => Object.assign(window, {
  __worker: { search, get, instances, statuses },
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
