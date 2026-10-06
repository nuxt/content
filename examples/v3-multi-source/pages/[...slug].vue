<template>
  <article v-if="page">
    <ContentRenderer :value="page" />

    <nav
      v-if="surround?.length"
      class="surround"
    >
      <NuxtLink
        v-if="surround[0]"
        :to="surround[0].path"
      >
        ← {{ surround[0].title }}
      </NuxtLink>
      <span v-else />
      <NuxtLink
        v-if="surround[1]"
        :to="surround[1].path"
      >
        {{ surround[1].title }} →
      </NuxtLink>
    </nav>
  </article>
  <div v-else>
    <h1>Page not found</h1>
    <p>No document matches <code>{{ route.path }}</code>.</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Each collection is mounted on its own prefix (see `content.config.ts`).
const collection = computed(() => route.path.startsWith('/blog') ? 'blog' : 'docs')

const { data: page } = await useAsyncData(() => `page-${route.path}`, () => {
  return queryCollection(collection.value).path(route.path).first()
})

const { data: surround } = await useAsyncData(() => `surround-${route.path}`, () => {
  return queryCollectionItemSurroundings(collection.value, route.path)
})

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})
</script>

<style scoped>
.surround {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
