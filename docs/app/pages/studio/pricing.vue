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
          solo: feature.soon ? 'Coming soon' : (feature.plans || []).includes('solo'),
          team: feature.soon ? 'Coming soon' : (feature.plans || []).includes('team'),
          unlimited: feature.soon ? 'Coming soon' : (feature.plans || []).includes('unlimited'),
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

// Should be non exported Row type from ui
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cell = (type: 'solo' | 'team' | 'unlimited', row: any) => {
  const value = row.original[type]
  const color = value === 'Coming soon'
    ? '!text-(--ui-text-muted)'
    : type === 'team' ? 'text-(--ui-primary)' : 'text-(--ui-text-highlighted)'
  const background = type === 'team' ? 'bg-gray-300/10 dark:bg-gray-800/50' : ''
  const borderBottom = row.original.main ? 'border-b border-(--ui-color-neutral-100) dark:border-(--ui-color-neutral-800)' : ''
  const borderSide = type === 'team' ? 'border-l border-r !border-r-(--ui-primary) !border-l-(--ui-primary)' : ''
  const borderClosed = type === 'team' && row.original.title?.includes('Commit') ? 'border-b border-b-(--ui-primary) rounded-b-lg' : ''

  return h('div', { class: `flex justify-center p-4 text-(--ui-text-highlighted) ${color} ${background} ${borderBottom} ${borderSide} ${borderClosed}` },
    typeof value === 'string'
      ? h('span', { class: 'h-5' }, value)
      : value === true
        ? h(UIcon, { name: 'i-lucide-circle-check', class: `${color} h-5` })
        : h('span', { class: 'h-5 flex items-center justify-center text-lg' }, '-'),
  )
}

const header = (type: 'solo' | 'team' | 'unlimited') => {
  const border = type === 'team' ? 'border-l border-r  border-t border-(--ui-primary) rounded-t-lg' : ''
  const gradient = type === 'team' ? 'bg-gradient-to-b from-(--ui-primary)/10 to-gray-300/10 dark:from-(--ui-primary)/20 dark:to-gray-800/50' : ''
  return h('div', { class: `flex flex-col items-center p-4 ${border} ${gradient}` }, [
    h('span', { class: 'text-lg font-semibold' }, page.value?.plans?.[type]?.title),
    h('span', { class: 'text-sm text-(--ui-text-muted)' }, `${page.value?.plans?.[type]?.price}${page.value?.plans?.[type]?.cycle}`),
  ])
}

const columns: TableColumn<Feature>[] = [
  {
    accessorKey: 'feature',
    header: '',
    cell: ({ row }) => {
      return row.original.main
        ? h('span', { class: 'flex text-(--ui-text-highlighted) font-medium border-b border-(--ui-color-neutral-100) dark:border-(--ui-color-neutral-800) p-4 w-full' }, row.original.title)
        : h('span', { class: 'text-(--ui-text-muted) p-4' }, row.original.title)
    },
  },
  {
    accessorKey: 'solo',
    header: () => header('solo'),
    cell: ({ row }) => cell('solo', row),
  },
  {
    accessorKey: 'team',
    header: () => header('team'),
    cell: ({ row }) => cell('team', row),
  },
  {
    accessorKey: 'unlimited',
    header: () => header('unlimited'),
    cell: ({ row }) => cell('unlimited', row),
  },
]
</script>

<template>
  <div v-if="page">
    <UContainer>
      <UPageHero
        :title="page.title"
        :description="page.description"
      />

      <UPageSection :ui="{ container: '!pt-0' }">
        <UPricingPlans orientation="horizontal">
          <UPricingPlan v-bind="page.plans.solo" />
          <UPricingPlan v-bind="page.plans.team" />
          <UPricingPlan v-bind="page.plans.unlimited" />
        </UPricingPlans>
      </UPageSection>
    </UContainer>

    <UPageSection
      :title="page.onboarding.title"
      :ui="{
        root: 'bg-(--ui-bg-elevated)/25 border-t border-b border-(--ui-border) mt-8 sm:mt-12 lg:mt-16',
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
          :ui="{
            tbody: 'divide-none',
            td: 'p-0',
            th: 'p-0 w-1/4',
          }"
        />
      </UPageSection>
    </UContainer>
  </div>
</template>
