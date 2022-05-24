<script setup>
const skip = ref(2)
const limit = ref(2)

const { data, refresh } = await useAsyncData('homepage', () => {
  return queryContent('/').skip(skip.value).limit(limit.value).find()
})

watch([skip, limit], () => {
  refresh()
})
</script>

<template>
  <NuxtExampleLayout example="queries/skip-limit" repo="nuxt/content">
    <label for="skip">Skip ({{ skip }})</label>
    <input id="skip" v-model="skip" type="range" min="0" max="5">
    <label for="skip">Limit ({{ limit }})</label>
    <input id="limit" v-model="limit" type="range" min="1" max="5">
    <section>
      <h2>Results: </h2>
      <ul>
        <li v-for="{_path, title} in data" :key="_path">
          {{ title }}
        </li>
      </ul>
    </section>
  </NuxtExampleLayout>
</template>
