<script setup>
const { path } = defineProps({
  path: {
    type: String,
    default: () => useRoute().path
  },
  surround: {
    type: Boolean,
    default: false
  }
})
const isPartial = path.includes('/_')
const { data: document } = await useAsyncData(`content-doc-${path}`, () => {
  return queryContent().where({ path, partial: isPartial }).findOne()
  // TODO: fix partial
  // TODO: add surround
})
if (document.value) {
  useHead({
    title: document.value.title,
    meta: [
      { name: 'description', content: document.value.description }
      // TODO: read document.value.meta
    ]
  })
}
</script>

<template>
  <Document v-if="document" v-model="document" />
  <div v-else>
    Not Found!
    <!-- TODO: slot -->
  </div>
</template>
