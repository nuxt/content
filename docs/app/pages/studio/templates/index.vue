<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('templates-landing', () => queryCollection('landing').path('/studio/templates').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: templates } = await useAsyncData('templates', () => queryCollection('templates').all())

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})

const badges = {
  'free': {
    color: 'secondary' as const,
    label: 'Free',
  },
  'nuxt-ui-pro': {
    color: 'primary' as const,
    label: 'Nuxt UI Pro',
  },
}
</script>

<template>
  <UPage>
    <NuxtImg
      src="/page-hero.svg"
      width="1440"
      height="400"
      class="absolute inset-x-0 hidden w-full top-48 xl:top-28 2xl:-mt-24 min-[2000px]:-mt-64 md:block"
      alt="Hero background"
    />

    <UPageHero
      :title="page?.title"
      :description="page?.description"
    />

    <UPageBody>
      <UContainer>
        <UBlogPosts>
          <UBlogPost
            v-for="(template, index) in templates"
            :key="index"
            :title="template.title"
            :description="template.description"
            :image="template.mainScreen"
            :to="`/studio/templates/${template.slug}`"
            :ui="{
              root: 'hover:ring-2 hover:ring-[var(--ui-primary)]',
              description: 'text-pretty',
              image: 'group-hover:scale-100',
            }"
          >
            <template #date>
              <UBadge
                :label="badges[template.licenseType].label"
                :color="badges[template.licenseType].color"
                variant="outline"
              />
            </template>
          </UBlogPost>
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
