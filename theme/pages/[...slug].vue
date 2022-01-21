<template>
  <Content v-if="page" :id="page.id" />
  <div v-else>Not Found!</div>
</template>

<script setup lang="ts">
const page = ref()

definePageMeta({
  // Use `docs` layout by default
  layout: ref('docs')
})

const router = useRouter()

// Router layout computed
const layout = computed({
  get: () => router.currentRoute.value.meta.layout?.value,
  set: newVal => {
    router.currentRoute.value.meta.layout.value = newVal
  }
})

// Layout update helper
const updateLayout = (_layout: string) => (layout.value ? (layout.value = _layout) : null)

// Content list query
const query = async () => {
  const result = await queryContent()
    .where({ slug: { $eq: router.currentRoute.value.path } })
    .fetch()
    .then(r => {
      const result = r[0]

      return result
    })

  if (result.layout) updateLayout(result.layout)

  page.value = result
}
await query()

// Set page meta from query results
useMeta(() => {
  return {
    title: page.value.title ?? '',
    meta: [
      {
        name: 'description',
        content: page.value.description ?? ''
      }
    ]
  }
})
</script>
