<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const siteConfig = useSiteConfig()
const UIcon = resolveComponent('UIcon')

const { data: page } = await useAsyncData('pricing-landing', () => queryCollection('pricing').path('/studio/pricing').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})

type Feature = {
  title: string
  main?: boolean
  solo: boolean | string
  team: boolean | string
  unlimited: boolean | string
}

const data = computed(() => {
  const features: Feature[] = []
  Object.values(page.value?.features.includes || {}).map((mainFeature) => {
    if ('includes' in mainFeature) {
      features.push({
        title: mainFeature.title,
        main: true,
        solo: '',
        team: '',
        unlimited: '',
      })

      Object.values(mainFeature.includes).forEach((feature) => {
        features.push({
          title: feature.title,
          solo: (feature.plans || []).includes('solo'),
          team: (feature.plans || []).includes('team'),
          unlimited: (feature.plans || []).includes('unlimited'),
        })
      })
    }
    else {
      const solo = mainFeature.plans ? mainFeature.plans.includes('solo') : mainFeature.value![0] as string
      const team = mainFeature.plans ? mainFeature.plans.includes('team') : mainFeature.value![1] as string
      const unlimited = mainFeature.plans ? mainFeature.plans.includes('unlimited') : mainFeature.value![2] as string
      features.push({
        title: mainFeature.title,
        main: true,
        solo,
        team,
        unlimited,
      })
    }
  })

  return features
})

const columns: TableColumn<Feature>[] = [
  {
    accessorKey: 'feature',
    header: '',
    cell: ({ row }) => {
      return row.original.main
        ? h('span', { class: 'text-[var(--ui-text-highlighted)] font-medium' }, row.original.title)
        : h('span', { class: 'text-[var(--ui-text-muted)]' }, row.original.title)
    },
  },
  {
    accessorKey: 'solo',
    header: () => {
      return h('div', { class: 'flex flex-col items-center' }, [
        h('span', { class: 'text-lg font-semibold text-[var(--ui-text-highlighted)]' }, page.value?.plans?.solo?.title),
        h('span', { class: 'text-sm text-[var(--ui-text-muted)]' }, page.value?.plans?.solo?.price),
      ])
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex justify-center text-[var(--ui-text-highlighted)]' },
        typeof row.original.solo === 'string'
          ? row.original.solo
          : row.original.solo === true
            ? h(UIcon, { name: 'i-lucide-circle-check', class: 'text-[var(--ui-text-highlighted)]' })
            : '_',
      )
    },
  },
  {
    accessorKey: 'team',
    header: () => {
      return h('div', { class: 'flex flex-col items-center' }, [
        h('span', { class: 'text-lg font-semibold' }, page.value?.plans?.team?.title),
        h('span', { class: 'text-sm text-[var(--ui-text-muted)]' }, `${page.value?.plans?.team?.price}${page.value?.plans?.team?.cycle}`),
      ])
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex justify-center text-[var(--ui-text-highlighted)]' },
        typeof row.original.team === 'string'
          ? row.original.team
          : row.original.team === true
            ? h(UIcon, { name: 'i-lucide-circle-check', class: 'text-[var(--ui-primary)]' })
            : '_',
      )
    },
  },
  {
    accessorKey: 'unlimited',
    header: () => {
      return h('div', { class: 'flex flex-col items-center' }, [
        h('span', { class: 'text-lg font-semibold' }, page.value?.plans?.unlimited?.title),
        h('span', { class: 'text-sm text-[var(--ui-text-muted)]' }, `${page.value?.plans?.unlimited?.price}${page.value?.plans?.unlimited?.cycle}`),
      ])
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex justify-center text-[var(--ui-text-highlighted)]' },
        typeof row.original.unlimited === 'string'
          ? row.original.unlimited
          : row.original.unlimited === true
            ? h(UIcon, { name: 'i-lucide-circle-check', class: 'text-[var(--ui-text-highlighted)]' })
            : '_',
      )
    },
  },
]
</script>

<template>
  <div v-if="page">
    <UContainer>
      <UPageHero
        :title="page.title"
        :description="page.description"
      >
        <div class="hidden sm:block">
          <UColorModeImage
            class="size-full absolute bottom-0 inset-x-4 z-[-1]"
            dark="/home/hero-dark.svg"
            light="/home/hero-light.svg"
          />
        </div>
      </UPageHero>
    </UContainer>

    <UPageSection
      :title="page.onboarding.title"
      :ui="{
        root: 'bg-[var(--ui-bg-elevated)]/25 border-t border-b border-[var(--ui-border)] mt-8 sm:mt-12 lg:mt-16',
        container: 'py-8 sm:py-12 lg:py-16',
      }"
    >
      <UColorModeImage
        class="size-full max-w-5xl mx-auto"
        :dark="page.onboarding.image.dark"
        :light="page.onboarding.image.light"
        alt="Onboarding steps when creating a project on Nuxt Studio"
      />
    </UPageSection>

    <UContainer>
      <UPageSection
        :title="page.features.title"
        :description="page.features.description"
      >
        <UTable
          :data="data"
          :columns="columns"
          :ui="{ tbody: 'divide-none' }"
        />
      </UPageSection>
    </UContainer>
  </div>
</template>
