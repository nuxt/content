<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '#ui-pro/utils/content'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

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

const page = computed(() => data.value?.page)
const surround = computed(() => data.value?.surround)
const title = computed(() => (page.value?.navigation as { title: string })?.title || page.value?.title)

const headline = computed(() => findPageHeadline(navigation!.value, page.value))
const titleName = computed(() => route.path.includes('studio') ? 'Nuxt Studio' : 'Nuxt Content')
useSeoMeta({
  titleTemplate: `%s - ${titleName.value}`,
  title: title.value,
  ogTitle: `${title.value} - ${titleName.value}`,
  description: page.value?.description,
  ogDescription: page.value?.description,
})

defineOgImageComponent('Docs', {
  headline: headline.value,
  title: title.value,
})

const communityLinks = computed(() => [{
  icon: 'i-lucide-pencil',
  label: 'Edit this page',
  to: `https://github.com/nuxt/content/edit/main/docs/content/${page.value?.stem}.${page.value?.extension}`,
  target: '_blank',
}, {
  icon: 'i-lucide-star',
  label: 'Star on GitHub',
  to: 'https://github.com/nuxt/content',
  target: '_blank',
}, {
  icon: 'i-simple-icons-discord',
  label: 'Chat on Discord',
  to: 'https://discord.gg/sBXDm6e8SP',
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

      <UContentSurround :surround="surround" />
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
            v-if="page.body.toc.links.length"
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
