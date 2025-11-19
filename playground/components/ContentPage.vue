<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, findPageChildren, findPageSiblings } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

interface TocLink {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

interface ContentData {
  title?: string
  description?: string
  body?: {
    toc?: {
      links?: TocLink[]
    }
  }
}

interface Props {
  data: ContentData | null
  navigation?: ContentNavigationItem[] | null
  surround?: ContentNavigationItem[] | null
}

const props = withDefaults(defineProps<Props>(), {
  navigation: () => [],
  surround: undefined,
})

const bodyTocLinksWithDebug = computed(() => {
  return [
    ...(props.data?.body?.toc?.links || []),
    {
      id: 'debug-nuxt-content',
      depth: 0,
      text: '🐞 Debug',
    },
  ]
})

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(props.navigation, useRoute().path, { indexAsChild: false, current: true })))

const children = computed(() => mapContentNavigation(findPageChildren(props.navigation, useRoute().path)))

const siblings = computed(() => mapContentNavigation(findPageSiblings(props.navigation, useRoute().path)))
</script>

<template>
  <UPage v-if="data">
    <template #left>
      <UPageAside>
        <UContentNavigation
          v-if="navigation?.length"
          :navigation="navigation"
        />
      </UPageAside>
    </template>

    <template #right>
      <UContentToc
        v-if="data?.body?.toc?.links"
        :links="bodyTocLinksWithDebug"
      />
    </template>

    <UPageHeader
      :title="data.title"
      :description="data.description"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>
    </UPageHeader>

    <UPageBody>
      <pre v-if="data.stem === 'csv' || data.stem === 'yml'">{{ data.body }}</pre>

      <ContentRenderer
        v-else
        :value="data"
      >
        <template #empty>
          <div>
            <h1>No Content Available</h1>
          </div>
        </template>
      </ContentRenderer>

      <ProseH2>Children</ProseH2>
      <ProseCardGroup>
        <ProseCard
          v-for="(child, index) in children"
          :key="index"
          :title="child.label"
          :to="child.to"
        />
      </ProseCardGroup>

      <ProseH2>Siblings</ProseH2>
      <ProseCardGroup>
        <ProseCard
          v-for="(sibling, index) in siblings"
          :key="index"
          :title="sibling.label"
          :to="sibling.to"
        />
      </ProseCardGroup>

      <template v-if="surround">
        <USeparator />
        <UContentSurround :surround="surround" />
      </template>

      <UCard>
        <template #header>
          <h3
            id="debug-nuxt-content"
            class="text-lg font-semibold mb-2"
          >
            Debug
          </h3>
        </template>

        <UTabs
          variant="link"
          :items="[
            { label: 'Content', content: data as string },
            { label: 'Surround', content: surround as unknown as string },
            { label: 'Navigation', content: navigation as unknown as string },
            { label: 'Content Toc', content: data?.body?.toc?.links as unknown as string },
          ]"
        >
          <template #content="{ item }">
            <ProsePre class="overflow-auto max-h-[300px] text-xs">
              {{ item }}
            </ProsePre>
          </template>
        </UTabs>
      </UCard>
    </UPageBody>
  </UPage>
</template>
