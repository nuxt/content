<template>
  <article v-if="page">
    <ContentRenderer :value="page" />
  </article>
  <div v-else>
    <h1>Page not found</h1>
    <p>No document matches <code>{{ route.path }}</code>.</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

// Collections are declared per locale (see both `content.config.ts`):
// `/<code>` → `landing_<code>` (layer), `/<code>/changelog/**` → `changelog_<code>`
// (project), everything else → `docs_<code>` (layer).
const collection = computed(() => {
  const code = locale.value.replace('-', '_')
  if (route.path === `/${locale.value}`) return `landing_${code}`
  if (route.path.startsWith(`/${locale.value}/changelog`)) return `changelog_${code}`
  return `docs_${code}`
})

const { data: page } = await useAsyncData(() => `page-${route.path}`, () => {
  return queryCollection(collection.value as any).path(route.path).first()
})

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})
</script>
