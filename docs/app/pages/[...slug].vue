<script setup lang="ts">
import { findPageHeadline } from '#ui-pro/utils/content'

const route = useRoute()

definePageMeta({
  layout: 'docs',
})

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['title', 'description'],
  })
}, { default: () => [] })

const headline = computed(() => findPageHeadline(page.value))

useSeoMeta({
  titleTemplate: '%s - Nuxt Content v3',
  title: page.value.navigation?.title || page.value.title,
  ogTitle: `${page.value.navigation?.title || page.value.title} - Nuxt Content v3`,
  description: page.value.description,
  ogDescription: page.value.description,
})

defineOgImageComponent('Docs', {
  headline: headline.value,
  title: page.value.title,
})

const communityLinks = computed(() => [{
  icon: 'i-heroicons-pencil-square',
  label: 'Edit this page',
  to: `https://github.com/nuxt/content/edit/v3/docs/content/${page?.value?.stem}.${page.value?.extension}`,
  target: '_blank',
}, {
  icon: 'i-heroicons-star',
  label: 'Star on GitHub',
  to: 'https://github.com/nuxt/content',
  target: '_blank',
}])
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :links="page.links"
      :headline="headline"
    >
      <template #description>
        <MDC
          v-if="page.description"
          :value="page.description"
          unwrap="p"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />

      <USeparator />

      <UContentSurround :surround="(surround as any)" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :links="page.body.toc.links"
        class="z-[2]"
      >
        <template #bottom>
          <USeparator
            v-if="page.body?.toc?.links?.length"
            type="dashed"
          />

          <UPageLinks
            title="Community"
            :links="communityLinks"
          />

          <!-- <USeparator type="dashed" />

          <UPageLinks title="Resources" :links="resourcesLinks" />

          <USeparator type="dashed" />

          <AdsPro />
          <AdsCarbon /> -->
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
