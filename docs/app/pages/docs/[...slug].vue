<script setup lang="ts">
import { findPageHeadline } from '#ui-pro/utils/content'

const route = useRoute()
const navigation = inject('navigation')

definePageMeta({
  layout: 'docs',
})

const { data } = await useAsyncData(route.path, () => Promise.all([
  queryCollection('docs').path(route.path).first(),
  queryCollectionItemSurroundings('docs', route.path, {
    fields: ['title', 'description'],
  }),
]), {
  transform: ([page, surround]) => ({ page, surround }),
})
if (!data.value || !data.value.page) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const headline = computed(() => findPageHeadline(navigation.value, data.value.page))

useSeoMeta({
  titleTemplate: '%s - Nuxt Content v3',
  title: data.value.page.navigation?.title || data.value.page.title,
  ogTitle: `${data.value.page.navigation?.title || data.value.page.title} - Nuxt Content v3`,
  description: data.value.page.description,
  ogDescription: data.value.page.description,
})

defineOgImageComponent('Docs', {
  headline: headline.value,
  title: data.value.page.title,
})

const communityLinks = computed(() => [{
  icon: 'i-lucide-pencil',
  label: 'Edit this page',
  to: `https://github.com/nuxt/content/edit/v3/docs/content/${data.value.page.stem}.${data.value.page.extension}`,
  target: '_blank',
}, {
  icon: 'i-lucide-star',
  label: 'Star on GitHub',
  to: 'https://github.com/nuxt/content',
  target: '_blank',
}])
</script>

<template>
  <UPage v-if="data.page">
    <UPageHeader
      :title="data.page.title"
      :links="data.page.links"
      :headline="headline"
    >
      <template #description>
        <MDC
          v-if="data.page.description"
          :value="data.page.description"
          unwrap="p"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="data.page.body"
        :value="data.page"
      />

      <USeparator />

      <UContentSurround :surround="(data.surround as any)" />
    </UPageBody>

    <template
      v-if="data.page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :links="data.page.body.toc.links"
        class="z-[2]"
      >
        <template #bottom>
          <USeparator
            v-if="data.page.body?.toc?.links?.length"
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
